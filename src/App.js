import './App.css';
import * as Astronomy from 'astronomy-engine'
import { useRef } from 'react';

export const App = () => {

  const canvasRef = useRef(null);

  const toDegrees = (angle) => {
    return angle * (180 / Math.PI);
  }

  const toRadians = (angle) => {
    return angle * (Math.PI / 180);
  }

  const latitude = 32.79801
  const longitude = -96.83573
  const building_height = 230 //in
  const building_length = 1920 //in
  const building_sun_angle = 210.67 //degrees
  const scale = {x:5, y:0.2}
  var d = 0;

  var shadow_offset = 0
  var shadow_width = 0
  var shadow_length = 0

  const calcSun = () => {
    d = new Date();
    const observer = new Astronomy.Observer(latitude, longitude, 0);
    let equ_ofdate = Astronomy.Equator('Sun', d, observer, true, true);
    let hor = Astronomy.Horizon(d, observer, equ_ofdate.ra, equ_ofdate.dec, 'normal');
    return hor;
  }

  const calcShadow = () => {
    shadow_offset = (building_height / Math.tan(toRadians(calcSun().altitude))) / 12.0;
    if (calcSun().azimuth > 210.67) {
      shadow_width = Math.abs(shadow_offset * Math.sin(toRadians(calcSun().azimuth - building_sun_angle))) * scale.x;
      shadow_length = Math.abs(shadow_offset * Math.cos(toRadians(calcSun().azimuth - building_sun_angle))) * scale.x;
    }
    else
      shadow_width = 0;
  }

  calcShadow()
  console.log(calcSun());
  console.log(shadow_offset);
  console.log(shadow_width);
  console.log(shadow_length)
  console.log(d);

  const drawShadow = () => {
    calcShadow()
    var pointOne = { x: 0, y: 0 }
    pointOne.x = 960-shadow_width/2;
    pointOne.y = building_length / 2 * scale.y + 540;

    const canvas = canvasRef.current
    const context = canvas.getContext('2d');
    context.reset()
    context.fillStyle = "rgba(0,0,0,0.5)";
    context.beginPath();
    context.moveTo(pointOne.x, pointOne.y);
    context.lineTo(pointOne.x + shadow_width, pointOne.y - shadow_length);
    context.lineTo(pointOne.x + shadow_width, pointOne.y - (building_length*scale.y));
    context.lineTo(pointOne.x, pointOne.y - (building_length*scale.y) + shadow_length);
    context.lineTo(pointOne.x, pointOne.y);
    context.closePath();
    //context.stroke();
    context.fill();
    context.beginPath();
    context.moveTo(pointOne.x, pointOne.y);
    context.lineTo(pointOne.x + shadow_width+5, pointOne.y - shadow_length-5);
    context.lineTo(pointOne.x + shadow_width+5, pointOne.y - (building_length*scale.y)-10);
    context.lineTo(pointOne.x, pointOne.y - (building_length*scale.y) + shadow_length);
    context.lineTo(pointOne.x, pointOne.y);
    context.closePath();
    //context.stroke();
    context.fill();
  }

  return <>
    <div className='app'>
      <canvas id="shadow" className='shadow' ref={canvasRef} width="1920" height="1080"></canvas>
      <button className='shadow-button' onClick={() => drawShadow()}>Draw Shadow</button>
    </div>
  </>;
}

export default App;
