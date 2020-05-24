import React from "react";
import Canvas from 'react-native-canvas';

function quadraticCurveMinMax(p0, p1, p2) {
  var min = p0;
  var max = p2;
  var t_step = 0.0001;
  for (var t = t_step; t <= 1; t += t_step) {
    var f = (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
    if (f < min) min = f;
    if (f > max) max = f;
  }
  return [Math.round(min), Math.round(max)];
}

class CurvedArrow extends React.PureComponent {
  componentWillUnmount() {
    if (this.timer) clearTimeout(this.timer);
  }

  getSettings = () => {
    const {
      fromSelector = "body",
      toSelector = fromSelector,
      fromOffsetX = 0,
      fromOffsetY = 0,
      toOffsetX = 0,
      toOffsetY = 0,
      middleX = 0,
      middleY = 0,
      width = 8,
      color = "black",
      hideIfFoundSelector,
      debugLine = false,
      dynamicUpdate = false,
      zIndex = 0
    } = this.props;

    if (this.timer) clearTimeout(this.timer);

    if (dynamicUpdate || (!fromSelector || !toSelector)) {
      this.timer = setTimeout(() => {
        this.forceUpdate();
      }, 1000);
    }

    console.debug(`Got here!`)

    if (!fromSelector || !toSelector) {
      return null;
    }

    if (hideIfFoundSelector) {
      if (document.querySelector(hideIfFoundSelector)) return null;
    }

    let rect;
    // rect = fromElement.getBoundingClientRect();
    // const p0x = rect.left + rect.width / 2 + fromOffsetX;
    // const p0y = rect.top + rect.height / 2 - fromOffsetY + window.scrollY;
    const p0x = fromSelector.x
    const p0y = fromSelector.y

    // rect = toElement.getBoundingClientRect();
    // const p2x = rect.left + rect.width / 2 + toOffsetX;
    // const p2y = rect.top + rect.height / 2 - toOffsetY + window.scrollY;
    const p2x = toSelector.x
    const p2y = toSelector.y

    const p1x = (p0x + p2x) / 2 + middleX;
    const p1y = (p0y + p2y) / 2 - middleY;

    var settings = {
      p0x,
      p0y,
      p1x,
      p1y,
      p2x,
      p2y,
      size: 30,
      lineWidth: width,
      strokeStyle: color,
      zIndex: zIndex,
      debugLine: debugLine
    };

    return settings;
  }

  handleCanvas = (canvas) => {
    const ctx = canvas.getContext('2d');
    console.debug(`Canvas is ${canvas}`)
    if (!canvas) return;

    let settings = this.getSettings();

    var x_min_max = quadraticCurveMinMax(
    settings.p0x,
    settings.p1x,
    settings.p2x
    );

    var y_min_max = quadraticCurveMinMax(
    settings.p0y,
    settings.p1y,
    settings.p2y
    );

    var padding = settings.size - settings.lineWidth;

    var x_min = x_min_max[0] - padding;
    var x_max = x_min_max[1] + padding;
    var y_min = y_min_max[0] - padding;
    var y_max = y_min_max[1] + padding;

    var p0x = settings.p0x - x_min;
    var p0y = settings.p0y - y_min;
    var p1x = settings.p1x - x_min;
    var p1y = settings.p1y - y_min;
    var p2x = settings.p2x - x_min;
    var p2y = settings.p2y - y_min;

    canvas.position = "absolute";
    canvas.pointerEvents = "none";
    canvas.top = y_min + "px";
    canvas.left = x_min + "px";
    canvas.width = x_max - x_min;
    canvas.height = y_max - y_min;

    if (settings.zIndex) {
    canvas.zIndex = settings.zIndex;
    }

    if (settings.debugLine) {
    ctx.arc(p0x, p0y, 10, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.arc(p1x, p1y, 10, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.arc(p2x, p2y, 10, 0, 2 * Math.PI);
    ctx.stroke();
    }

    // Styling
    ctx.strokeStyle = settings.strokeStyle;
    ctx.lineWidth = settings.lineWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // Arrow body
    ctx.beginPath();
    ctx.moveTo(p0x, p0y);
    ctx.quadraticCurveTo(p1x, p1y, p2x, p2y);
    ctx.stroke();

    // Arrow head
    var angle = Math.atan2(p2y - p1y, p2x - p1x);
    ctx.translate(p2x, p2y);

    // Right side
    ctx.rotate(angle + 1);
    ctx.beginPath();
    ctx.moveTo(0, settings.size);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // Left side
    ctx.rotate(-2);
    ctx.lineTo(0, -settings.size);
    ctx.stroke();

    // Restore context
    ctx.rotate(1 - angle);
    ctx.translate(-p2x, -p2y);
  }

  render() {
    return (
      <Canvas
          style={{position: "absolute"}}
        ref={this.handleCanvas}
      />
    );
  }
}

export default CurvedArrow;
