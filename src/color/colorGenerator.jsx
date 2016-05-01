class ColorGenerator {
  constructor() {
    this.colorMap = {};
    this.colorPool = [];
  }

  addColor(key, color) {
    this.colorMap[key] = color;
  }

  getColor(key) {
    if (!this.colorMap[key]) {
      if (this.colorPool.length === 0) {
        this.colorPool = randomColor({
           luminosity: 'light',
           count: 40
        });
      }
      this.colorMap[key] = this.colorPool.pop();
    }
    return this.colorMap[key];
  }
}
