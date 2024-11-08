import { Vector } from "./vector.ts";

export abstract class Shape {
	abstract toHtml(): string;
	abstract toCss(camera: Camera): string;
}

export class Box extends Shape {
	index: number;

	pos: Vector;
	size: Vector;
	rot: number[];

	faceColors: string[];

	constructor(pos: Vector, size: Vector, rot: Vector, faceColors: string[], index: number) {
		super();

		this.index = index;

		this.pos = pos;
		this.size = size;
		this.rot = rot;

		if (faceColors.length === 1) {
			this.faceColors = [
				faceColors[0],
				faceColors[0],
				faceColors[0],
				faceColors[0],
				faceColors[0],
				faceColors[0],
			];
		} else {
			this.faceColors = faceColors;
		}
	}

	override toHtml(): string {
		return `
            <div class="box_${this.index}">
                <div class="box_face_${this.index} box_face_${this.index}_front"></div>
                <div class="box_face_${this.index} box_face_${this.index}_back"></div>
                <div class="box_face_${this.index} box_face_${this.index}_right"></div>
                <div class="box_face_${this.index} box_face_${this.index}_left"></div>
                <div class="box_face_${this.index} box_face_${this.index}_top"></div>
                <div class="box_face_${this.index} box_face_${this.index}_bottom"></div>
            </div>
        `;
	}

	override toCss(camera: Camera): string {
		return `
            .box_${this.index} {
                width: ${this.size.x}px;
                height: ${this.size.y}px;
                position: absolute;
                transform-style: preserve-3d;
                transform:  translateX(calc(100vw / 2 - ${
					this.pos.x - camera.pos.x + this.size.x / 2
				}px) ) translateY(calc(100vh / 2 - ${
			this.pos.y - camera.pos.y + this.size.y / 2
		}px)) translateZ(${this.pos.z - camera.pos.z + this.size.z / 2}px) rotate3D(${this.rot[1]}, ${
			this.rot[2]
		}, ${this.rot[3]}, ${this.rot[0]}deg);
                /*transform:  translateX(calc(100vw / 2 - ${this.pos.x}px) ) translateY(calc(100vh / 2 - ${
			this.pos.y
		}px)) translateZ(${this.pos.z}px) rotate3D(${this.rot[1]}, ${this.rot[2]}, ${this.rot[3]}, ${
			this.rot[0]
		}deg);*/
                transition: transform 1s;
            }

            .box_face_${this.index} {
                position: absolute;
                border: 1px solid black;
                font-size: 40px;
                font-weight: bold;
                color: white;
                text-align: center;
            }

            .box_face_${this.index}_front,
            .box_face_${this.index}_back {
                width: ${this.size.x}px;
                height: ${this.size.y}px;
                line-height: ${this.size.y}px;
            }

            .box_face_${this.index}_right,
            .box_face_${this.index}_left {
                width: ${this.size.z}px;
                height: ${this.size.y}px;
                left: ${this.size.x / 2 - this.size.z / 2}px;
                line-height: ${this.size.y}px;
            }

            .box_face_${this.index}_top,
            .box_face_${this.index}_bottom {
                width: ${this.size.x}px;
                height: ${this.size.z}px;
                top: ${this.size.y / 2 - this.size.z / 2}px;
                line-height: ${this.size.z}px;
            }

            .box_face_${this.index}_front  { background: ${this.faceColors[0]}; }
            .box_face_${this.index}_right  { background: ${this.faceColors[3]}; }
            .box_face_${this.index}_back   { background: ${this.faceColors[2]}; }
            .box_face_${this.index}_left   { background: ${this.faceColors[1]}; }
            .box_face_${this.index}_top    { background: ${this.faceColors[4]}; }
            .box_face_${this.index}_bottom { background: ${this.faceColors[5]}; }

            .box_face_${this.index}_front  { transform: rotateY(  0deg) translateZ(${this.size.z / 2}px); }
            .box_face_${this.index}_back   { transform: rotateY(180deg) translateZ(${this.size.z / 2}px); }

            .box_face_${this.index}_right  { transform: rotateY( 90deg) translateZ(${this.size.x / 2}px); }
            .box_face_${this.index}_left   { transform: rotateY(-90deg) translateZ(${this.size.x / 2}px); }

            .box_face_${this.index}_top    { transform: rotateX( 90deg) translateZ(${this.size.y / 2}px); }
            .box_face_${this.index}_bottom { transform: rotateX(-90deg) translateZ(${this.size.y / 2}px); }
        `;
	}
}

export class Plane extends Shape {
	override toHtml(): string {
		throw new Error("Method not implemented.");
	}

	override toCss(camera: Camera): string {
		throw new Error("Method not implemented.");
	}
}

export class Camera {
	pos: Vector;
	rot: Vector;

	constructor(position: Vector, rotation: Vector) {
		this.pos = position;
		this.rot = rotation;
	}

	toCss(): string {
		return `
        .camera {
                width: 400px;
            height: 400px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            perspective: 400px;
               }
        }
        `;
	}
}
