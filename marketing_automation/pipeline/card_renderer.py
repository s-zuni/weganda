import base64
import re
import html as html_lib
from pathlib import Path
from typing import List
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from config import BASE_DIR, Config
from pipeline.content_planner import CarouselPlan, SlideItem

W, H = 1080, 1350
MARGIN_X = 70
TEXT_W = W - MARGIN_X * 2  # 940
BULLET_TEXT_W = W - MARGIN_X - 40 - 150  # 카드 안쪽 텍스트 영역

# 배경 워터마크 로고 (정중앙, 흐리게)
LOGO_PATH = BASE_DIR / "assets" / "logo" / "weganda_logo.png"
LOGO_SIZE = 700
LOGO_OPACITY = 0.10
LOGO_BLUR = 3
FONT_DIR = BASE_DIR / "assets" / "fonts"


class CardRenderer:
    """
    고화질 인스타그램 카드뉴스(1080x1350) 렌더러
    - 1순위: Playwright 헤드리스 브라우저를 통한 HTML/CSS 정밀 렌더링
    - 2순위: Pillow(PIL) 기반 안정적 폴백 렌더링
    * 외부 템플릿 엔진 의존성 없이 순수 파이썬으로 가볍고 안전하게 치환합니다.
    """

    def __init__(self):
        self.template_path = Config.TEMPLATE_DIR / "slide.html"
        with open(self.template_path, "r", encoding="utf-8") as f:
            self.raw_html_template = f.read()
        self._logo_cache = None

    def _logo_layer(self):
        """정중앙 워터마크용 RGBA 레이어(흐림·저투명도 적용). 로고 파일이 없으면 None."""
        if self._logo_cache is None:
            if not LOGO_PATH.is_file():
                print(f"[렌더러 안내] 로고 파일이 없어 워터마크를 생략합니다: {LOGO_PATH}")
                self._logo_cache = False
            else:
                logo = Image.open(LOGO_PATH).convert("RGBA").resize((LOGO_SIZE, LOGO_SIZE), Image.Resampling.LANCZOS)
                # 투명 가장자리의 검정이 번지지 않도록 '프리멀티플라이드 알파' 상태에서 블러
                logo = logo.convert("RGBa").filter(ImageFilter.GaussianBlur(LOGO_BLUR)).convert("RGBA")
                logo.putalpha(logo.getchannel("A").point(lambda a: int(a * LOGO_OPACITY)))
                layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                # 마스크 없이 그대로 복사해야 투명도가 한 번만 적용된다 (마스크를 주면 alpha²이 되고 색이 어두워짐)
                layer.paste(logo, ((W - LOGO_SIZE) // 2, (H - LOGO_SIZE) // 2))
                self._logo_cache = layer
        return self._logo_cache or None

    def _logo_data_uri(self) -> str:
        """HTML 렌더링용: 로고를 data URI로 인라인 (외부 파일 경로 의존 제거)"""
        if not LOGO_PATH.is_file():
            return ""
        return "data:image/png;base64," + base64.b64encode(LOGO_PATH.read_bytes()).decode("ascii")

    def _render_html_string(self, slide: SlideItem, page_str: str, footer_hint: str) -> str:
        """HTML 템플릿의 변수를 안전하게 치환"""
        # 크롤링/LLM 텍스트는 신뢰할 수 없으므로 모두 HTML 이스케이프 후 삽입
        esc = html_lib.escape
        html = self.raw_html_template

        # 1) {% if ... %}…{% endif %} 블록을 '블록 단위'로 먼저 치환 (줄 단위로 endif만 지우면 뒤 블록 치환이 깨진다)
        subtitle_html = f'<p class="subtitle">{esc(slide.subtitle)}</p>' if slide.subtitle else ""
        bullet_cards = "\n".join(
            f'<div class="bullet-card"><div class="bullet-icon"></div><div class="bullet-text">{esc(b)}</div></div>'
            for b in slide.bullets
        )
        bullets_html = f'<div class="bullet-list">\n{bullet_cards}\n</div>' if slide.bullets else ""
        html = re.sub(r"\{% if bullets %\}.*?\{% endif %\}", lambda m: bullets_html, html, flags=re.S)
        html = re.sub(r"\{% if subtitle %\}.*?\{% endif %\}", lambda m: subtitle_html, html, flags=re.S)

        # 2) 단순 변수 치환 (제목 줄바꿈은 CSS white-space: pre-line 이 처리)
        replacements = {
            "{{ badge }}": esc(slide.badge or "채용 속보"),
            "{{ title }}": esc(slide.title),
            "{{ page_str }}": esc(page_str),
            "{{ footer_hint }}": esc(footer_hint),
            "{{ logo_src }}": self._logo_data_uri(),
        }
        for key, value in replacements.items():
            html = html.replace(key, value)
        return html

    def render_carousel(self, carousel: CarouselPlan, session_id: str) -> List[str]:
        """
        슬라이드 전체를 렌더링하고 생성된 이미지 경로 목록을 반환합니다.
        """
        output_paths: List[str] = []
        total_pages = len(carousel.slides)

        out_dir = Config.OUTPUT_DIR / session_id
        out_dir.mkdir(parents=True, exist_ok=True)

        # Playwright 사용 가능 여부 확인
        use_playwright = True
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            use_playwright = False

        if use_playwright:
            try:
                with sync_playwright() as p:
                    browser = p.chromium.launch()
                    page = browser.new_page(viewport={"width": W, "height": H})
                    for idx, slide in enumerate(carousel.slides, start=1):
                        out_path = out_dir / f"slide_{idx}.png"
                        footer_hint = "" if idx < total_pages else "우간다 앱에서 확인하기"
                        rendered_html = self._render_html_string(
                            slide=slide,
                            page_str=f"{idx} / {total_pages}",
                            footer_hint=footer_hint,
                        )
                        page.set_content(rendered_html, wait_until="networkidle")
                        page.screenshot(path=str(out_path))
                        output_paths.append(str(out_path))
                    browser.close()
                    print(f"[렌더러] Playwright로 카드뉴스 {len(output_paths)}장 렌더링 완료.")
                    return output_paths
            except Exception as e:
                print(f"[렌더러 안내] Playwright 렌더링 건너뜀 ({e}) ➔ Pillow 고품질 엔진으로 생성합니다.")
                output_paths.clear()

        # Pillow 렌더러
        return self._render_with_pillow(carousel.slides, out_dir)

    def _get_font(self, size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
        # 1순위: 프로젝트에 번들된 Pretendard (OS와 무관하게 동일한 결과 — Railway 등 Linux 배포 필수)
        font_candidates = [
            str(FONT_DIR / ("Pretendard-Bold.otf" if bold else "Pretendard-SemiBold.otf")),
            "C:/Windows/Fonts/malgunbd.ttf" if bold else "C:/Windows/Fonts/malgun.ttf",
            "C:/Windows/Fonts/NanumGothicBold.ttf" if bold else "C:/Windows/Fonts/NanumGothic.ttf",
            "/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf" if bold else "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
            "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc" if bold else "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        ]
        for path in font_candidates:
            if Path(path).is_file():
                try:
                    return ImageFont.truetype(path, size)
                except Exception:
                    pass
        return ImageFont.load_default()

    @staticmethod
    def _wrap(text: str, font: ImageFont.FreeTypeFont, max_width: int) -> List[str]:
        """픽셀 폭 기준 줄바꿈: 공백 단위로 채우되, 한 단어가 폭을 넘으면 글자 단위로 분할."""
        lines: List[str] = []
        for para in (text or "").split("\n"):
            cur = ""
            for word in para.split():
                cand = f"{cur} {word}".strip()
                if font.getlength(cand) <= max_width:
                    cur = cand
                    continue
                if cur:
                    lines.append(cur)
                    cur = ""
                for ch in word:
                    if cur and font.getlength(cur + ch) > max_width:
                        lines.append(cur)
                        cur = ch
                    else:
                        cur += ch
            if cur:
                lines.append(cur)
        return lines or [""]

    def _fit_title(self, title: str):
        """제목이 3줄 안에 들어오도록 폰트를 줄여가며 맞춘다 (52px → 최소 38px)."""
        size = 52
        while True:
            font = self._get_font(size, bold=True)
            lines = self._wrap(title, font, TEXT_W)
            if len(lines) <= 3 or size <= 38:
                return font, lines[:4]
            size -= 4

    def _render_with_pillow(self, slides: List[SlideItem], out_dir: Path) -> List[str]:
        output_paths: List[str] = []
        total_pages = len(slides)

        font_badge = self._get_font(28, bold=True)
        font_brand = self._get_font(32, bold=True)
        font_title = self._get_font(52, bold=True)
        font_sub = self._get_font(30, bold=False)
        font_bullet = self._get_font(32, bold=True)
        font_footer = self._get_font(26, bold=False)
        font_hint = self._get_font(28, bold=True)

        for idx, slide in enumerate(slides, start=1):
            out_path = out_dir / f"slide_{idx}.png"
            img = Image.new("RGBA", (W, H), (248, 249, 253, 255))  # Soft background
            logo = self._logo_layer()
            if logo is not None:
                img = Image.alpha_composite(img, logo)  # 정중앙 흐린 로고 (가장 아래 레이어)
            draw = ImageDraw.Draw(img)

            # 1. 상단 뱃지 (글자 폭에 맞춰 알약 크기 조절)
            badge_text = slide.badge or "채용 속보"
            badge_w = int(font_badge.getlength(badge_text)) + 70
            draw.rounded_rectangle([70, 75, 70 + badge_w, 140], radius=32, fill=(255, 230, 237))
            draw.text((105, 90), badge_text, font=font_badge, fill=(255, 80, 124))

            # 2. 로고 텍스트
            draw.text((780, 90), "weganda 우간다", font=font_brand, fill=(27, 37, 75))

            # 3. 본문 블록 레이아웃 계산 (제목·서브타이틀·불렛 모두 폭에 맞춰 줄바꿈)
            title_font, title_lines = self._fit_title(slide.title)
            title_lh = int(title_font.size * 1.3)
            sub_lines = self._wrap(slide.subtitle, font_sub, TEXT_W) if slide.subtitle else []
            bullet_lines = [self._wrap(b, font_bullet, BULLET_TEXT_W)[:3] for b in slide.bullets]
            card_hs = [48 + len(ls) * 44 for ls in bullet_lines]

            block_h = len(title_lines) * title_lh
            if sub_lines:
                block_h += 16 + len(sub_lines) * 42
            if bullet_lines:
                block_h += 56 + sum(card_hs) + 28 * (len(card_hs) - 1)

            # 헤더(≈150)와 푸터(≈1230) 사이에서 세로 중앙 정렬, 단 너무 위로 붙지 않게 최소 y=210
            y = max(210, 150 + (1230 - 150 - block_h) // 2)
            for line in title_lines:
                draw.text((MARGIN_X, y), line, font=title_font, fill=(27, 37, 75))
                y += title_lh
            if sub_lines:
                y += 16
                for line in sub_lines:
                    draw.text((MARGIN_X, y), line, font=font_sub, fill=(107, 114, 128))
                    y += 42
            if bullet_lines:
                y += 56
                cards = []
                for lines, card_h in zip(bullet_lines, card_hs):
                    cards.append((y, card_h, lines))
                    y += card_h + 28
                # 카드는 반투명 흰색이라 뒤의 로고가 은은하게 비친다
                overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                od = ImageDraw.Draw(overlay)
                for cy, card_h, _ in cards:
                    od.rounded_rectangle([MARGIN_X, cy, W - MARGIN_X, cy + card_h], radius=24,
                                         fill=(255, 255, 255, 225), outline=(230, 235, 245, 255))
                img = Image.alpha_composite(img, overlay)
                draw = ImageDraw.Draw(img)
                for cy, card_h, lines in cards:
                    draw.ellipse([105, cy + card_h // 2 - 10, 125, cy + card_h // 2 + 10], fill=(255, 80, 124))
                    ty = cy + 24
                    for line in lines:
                        draw.text((150, ty), line, font=font_bullet, fill=(45, 55, 72))
                        ty += 44

            # 4. 푸터
            draw.line([(70, 1230), (1010, 1230)], fill=(237, 242, 247), width=2)
            draw.text((70, 1260), f"{idx} / {total_pages}", font=font_footer, fill=(160, 174, 192))
            if idx == total_pages:  # 마지막 장에만 앱 안내 (스와이프 문구는 사용하지 않음)
                hint = "프로필 링크에서 우간다 앱 확인"
                hint_w = int(font_hint.getlength(hint))
                draw.text((W - MARGIN_X - hint_w, 1260), hint, font=font_hint, fill=(255, 80, 124))

            img.convert("RGB").save(str(out_path), "PNG")
            output_paths.append(str(out_path))

        print(f"[렌더러] 한글 폰트 적용 카드뉴스 {len(output_paths)}장 생성 완료.")
        return output_paths

