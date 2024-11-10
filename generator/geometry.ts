import { Keyframe } from "./project.ts";
import { Vector } from "./vector.ts";

const FRAME_RATE = 60;

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
	totalFrames: number;

	keyframes: Keyframe[];

	constructor(
		pos: Vector,
		size: Vector,
		rot: Vector,
		faceColors: string[],
		keyframes: Keyframe[],
		index: number,
		totalFrames: number
	) {
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

		this.totalFrames = totalFrames;
		this.keyframes = keyframes;
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
		const keyframes = this.keyframes
			.map((keyframe) => {
				return `
                ${Math.floor((keyframe.frame / this.totalFrames) * 100)}% {
                    transform: translateX(calc(50vw -  ${
						keyframe.loc.x + keyframe.scale.x / 2 - camera.pos.x
					}px)) 
                          translateY(calc(50vh - ${keyframe.loc.y + keyframe.scale.y / 2 - camera.pos.y}px)) 
                          translateZ(${keyframe.loc.z + keyframe.scale.z / 2 - camera.pos.z}px) 
                          rotate3D(${keyframe.rot[1]}, ${keyframe.rot[2]}, ${keyframe.rot[3]}, ${
					keyframe.rot[0]
				}deg);
                }
            `;
			})
			.join("\n");

		return `
            .box_${this.index} {
                width: ${this.size.x}px;
                height: ${this.size.y}px;
                position: absolute;
                transform-style: preserve-3d;
                transform: translateX(calc(50vw -  ${this.pos.x + this.size.x / 2 - camera.pos.x}px)) 
                          translateY(calc(50vh - ${this.pos.y + this.size.y / 2 - camera.pos.y}px)) 
                          translateZ(${this.pos.z + this.size.z / 2 - camera.pos.z}px) 
                          rotate3D(${this.rot[1]}, ${this.rot[2]}, ${this.rot[3]}, ${this.rot[0]}deg);
                animation-duration: ${this.totalFrames / FRAME_RATE}s;
                animation-iteration-count: infinite;
                animation-direction: normal;
                animation-name: box_${this.index}_animation;
            }

            @keyframes box_${this.index}_animation {
                ${keyframes}
            }

            .box_face_${this.index} {
                position: absolute;
                border: 1px solid black;
            }

            .box_face_${this.index}_front,
            .box_face_${this.index}_back {
                width: ${this.size.x}px;
                height: ${this.size.y}px;
            }

            .box_face_${this.index}_right,
            .box_face_${this.index}_left {
                width: ${this.size.z}px;
                height: ${this.size.y}px;
                left: ${this.size.x / 2 - this.size.z / 2}px;
            }

            .box_face_${this.index}_top,
            .box_face_${this.index}_bottom {
                width: ${this.size.x}px;
                height: ${this.size.z}px;
                top: ${this.size.y / 2 - this.size.z / 2}px;
            }

            .box_face_${this.index}_front  { background: ${
			this.faceColors[0]
		}; transform: rotateY(  0deg) translateZ(${this.size.z / 2}px); }
            .box_face_${this.index}_right  { background: ${
			this.faceColors[3]
		}; transform: rotateY( 90deg) translateZ(${this.size.x / 2}px); }
            .box_face_${this.index}_back   { background: ${
			this.faceColors[2]
		}; transform: rotateY(180deg) translateZ(${this.size.z / 2}px); }
            .box_face_${this.index}_left   { background: ${
			this.faceColors[1]
		}; transform: rotateY(-90deg) translateZ(${this.size.x / 2}px); }
            .box_face_${this.index}_top    { background: ${
			this.faceColors[4]
		}; transform: rotateX( 90deg) translateZ(${this.size.y / 2}px); }
            .box_face_${this.index}_bottom { background: ${
			this.faceColors[5]
		}; transform: rotateX(-90deg) translateZ(${this.size.y / 2}px); }

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
