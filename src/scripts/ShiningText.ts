import { BlurText } from '@/scripts/BlurText';

type ShiningTextProps = {
  text: string;
  fontSize: number;
};

export class ShiningText {
  elm: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  text: string;
  fontSize: number;
  rText: BlurText;
  gText: BlurText;
  bText: BlurText;
  yText: BlurText;

  constructor({ text, fontSize }: ShiningTextProps) {
    this.elm = document.createElement('canvas');
    this.ctx = this.elm.getContext('2d');
    this.text = text;
    this.fontSize = fontSize;
    this.rText = new BlurText({ text, color: 'red', fontSize });
    this.gText = new BlurText({ text, color: 'green', fontSize });
    this.bText = new BlurText({ text, color: 'blue', fontSize });
    this.yText = new BlurText({ text, color: 'yellow', fontSize });

    this.elm.width = fontSize * this.text.length * 4;
    this.elm.height = fontSize * 4;

    if (this.ctx) {
      this.ctx.font = `${fontSize}px serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
    }

    this.render();
  }

  render() {
    if (!this.ctx) return;

    const now = performance.now();
    const canvas = this.elm;
    const ctx = this.ctx;
    const x = Math.sin(now) * 32;
    const y = Math.cos(now) * 32;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';

    ctx.drawImage(this.rText.elm, y, x);
    ctx.drawImage(this.gText.elm, -y, -x);
    ctx.drawImage(this.bText.elm, -x, -y);
    ctx.drawImage(this.yText.elm, x, y);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillText(this.text, canvas.width / 4, canvas.height / 4);
    ctx.restore();
  }

  update() {
    this.rText.update();
    this.gText.update();
    this.bText.update();
    this.yText.update();
    this.render();
  }
}
