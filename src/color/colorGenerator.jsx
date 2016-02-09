class ColorGenerator {
  constructor() {
    this.colorMap = {};
  }
  
  getColor(key) {
    if (!this.colorMap[key]) {
      this.colorMap[key] = randomColor();
    }
    return this.colorMap[key];
  }
}