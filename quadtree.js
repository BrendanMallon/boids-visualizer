class Point {
  constructor(x, y, data) {
    this.x = x;
    this.y = y;
    this.data = data;
  }
}

class Rectangle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }

  contains(point) {
    return (
      point.x > this.x &&
      point.x < this.x + this.width &&
      point.y > this.y &&
      point.y < this.y + this.height
    );
  }

  /**
   * @param {Rectangle} range
   */
  intersects(range) {
    return !(
      range.x > this.x + this.width ||
      range.x + range.width < this.x ||
      range.y > this.y + this.height ||
      range.y + range.height < this.y
    );
  }
}

class QuadTree {
  constructor(boundry, capacity) {
    this.boundry = boundry;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
  }

  subdivide() {
    let x = this.boundry.x;
    let y = this.boundry.y;
    let w = this.boundry.width;
    let h = this.boundry.height;
    let nw = new Rectangle(x, y, w / 2, h / 2);
    let ne = new Rectangle(x + w / 2, y, w / 2, h / 2);
    let sw = new Rectangle(x, y + h / 2, w / 2, h / 2);
    let se = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2);
    this.northwest = new QuadTree(nw, this.capacity);
    this.northeast = new QuadTree(ne, this.capacity);
    this.southwest = new QuadTree(sw, this.capacity);
    this.southeast = new QuadTree(se, this.capacity);
    for (let point of this.points) {
      this.northwest.insert(point);
      this.northeast.insert(point);
      this.southwest.insert(point);
      this.southeast.insert(point);
    }
    this.points = [];
    this.divided = true;
  }

  insert(point) {
    if (!this.boundry.contains(point)) {
      return;
    }
    if (this.points.length < this.capacity && !this.divided) {
      this.points.push(point);
    } else {
      if (!this.divided) {
        this.subdivide();
      }
      this.northwest.insert(point);
      this.northeast.insert(point);
      this.southwest.insert(point);
      this.southeast.insert(point);
    }
  }

  query(range, temp) {
    if (!temp) {
      temp = [];
    }
    if (!this.boundry.intersects(range)) {
      return;
    } else {
      for (let point of this.points) {
        if (range.contains(point)) {
          temp.push(point.data);
        }
      }
      if (this.divided) {
        this.northwest.query(range, temp);
        this.northeast.query(range, temp);
        this.southwest.query(range, temp);
        this.southeast.query(range, temp);
      }
    }
    return temp;
  }

  drawDivides(ctx) {
    if (this.divided) {
      let x = this.boundry.x;
      let y = this.boundry.y;
      let w = this.boundry.width;
      let h = this.boundry.height;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w / 2, y + h);
      ctx.stroke();
      ctx.moveTo(x, y + h / 2);
      ctx.lineTo(x + w, y + h / 2);
      ctx.stroke();
      this.northwest.drawDivides(ctx);
      this.northeast.drawDivides(ctx);
      this.southwest.drawDivides(ctx);
      this.southeast.drawDivides(ctx);
    }
  }

  drawPoints(ctx) {
    for (let point of this.points) {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    }
    if (this.northwest != null) {
      this.northwest.drawPoints(ctx);
    }
    if (this.northeast != null) {
      this.northeast.drawPoints(ctx);
    }
    if (this.southwest != null) {
      this.southwest.drawPoints(ctx);
    }
    if (this.southeast != null) {
      this.southeast.drawPoints(ctx);
    }
  }
}
