type BlurTextProps = {
  text: string;
  color: string;
  fontSize: number;
};

const maxCount = 80;

export class BlurText {
  elm: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  count: number;
  text: string;
  color: string;
  fontSize: number;

  constructor({ text, color, fontSize }: BlurTextProps) {
    this.elm = document.createElement('canvas');
    this.ctx = this.elm.getContext('2d');
    this.count = 0;
    this.text = text;
    this.color = color;
    this.fontSize = fontSize;

    this.elm.width = fontSize * this.text.length * 2;
    this.elm.height = fontSize * 2;

    if (this.ctx) {
      this.ctx.font = `${fontSize}px serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
    }

    this.render();
  }

  render() {
    if (!this.ctx) return;

    const canvas = this.elm;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = `blur(${8 + this.count}px)`;

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.globalCompositeOperation = 'luminosity';
    ctx.globalAlpha = ((maxCount - this.count) / maxCount) ** 2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillText(this.text, canvas.width / 2, canvas.height / 2);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillText(this.text, canvas.width / 2, canvas.height / 2);
    ctx.restore();
  }

  update() {
    this.count = (this.count + 1) % maxCount;
    this.render();
  }
}
