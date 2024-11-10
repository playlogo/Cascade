import { Keyframe } from "./project.ts";
import { Vector } from "./vector.ts";

const FRAME_RATE = 60;
const MAX_DECIMALS = 2;

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
            <div class="b_${this.index}">
                <div class="b_f_${this.index} b_f_${this.index}_f"></div>
                <div class="b_f_${this.index} b_f_${this.index}_ba"></div>
                <div class="b_f_${this.index} b_f_${this.index}_r"></div>
                <div class="b_f_${this.index} b_f_${this.index}_l"></div>
                <div class="b_f_${this.index} b_f_${this.index}_t"></div>
                <div class="b_f_${this.index} b_f_${this.index}_bo"></div>
            </div>
        `;
	}

	override toCss(camera: Camera): string {
		let includedKeyframes = new Set<number>();
		const keyframes = this.keyframes
			.filter((keyframe) => {
				const frame = Math.floor((keyframe.frame / this.totalFrames) * 100);
				if (includedKeyframes.has(frame)) {
					return false;
				}

				includedKeyframes.add(frame);
				includedKeyframes.add(frame + 1);

				return true;
			})
			.map((keyframe) => {
				return `
                ${Math.floor((keyframe.frame / this.totalFrames) * 100)}% {
                    transform: translateX(calc(50vw -  ${(
						keyframe.loc.x +
						keyframe.scale.x / 2 -
						camera.pos.x
					).toFixed(MAX_DECIMALS)}px)) 
                          translateY(calc(50vh - ${(
								keyframe.loc.y +
								keyframe.scale.y / 2 -
								camera.pos.y
							).toFixed(MAX_DECIMALS)}px)) 
                          translateZ(${(keyframe.loc.z + keyframe.scale.z / 2 - camera.pos.z).toFixed(
								MAX_DECIMALS
							)}px) 
                          rotate3D(${keyframe.rot[1].toFixed(MAX_DECIMALS)}, ${keyframe.rot[2].toFixed(
					MAX_DECIMALS
				)}, ${keyframe.rot[3].toFixed(MAX_DECIMALS)}, ${keyframe.rot[0].toFixed(MAX_DECIMALS)}deg);
                }
            `;
			})
			.join("\n");

		return `
            .b_${this.index} {
                width: ${this.size.x.toFixed(MAX_DECIMALS)}px;
                height: ${this.size.y.toFixed(MAX_DECIMALS)}px;
                position: absolute;
                transform-style: preserve-3d;
                transform: translateX(calc(50vw -  ${(this.pos.x + this.size.x / 2 - camera.pos.x).toFixed(
					MAX_DECIMALS
				)}px)) 
                          translateY(calc(50vh - ${(this.pos.y + this.size.y / 2 - camera.pos.y).toFixed(
								MAX_DECIMALS
							)}px)) 
                          translateZ(${(this.pos.z + this.size.z / 2 - camera.pos.z).toFixed(
								MAX_DECIMALS
							)}px) 
                          rotate3D(${this.rot[1].toFixed(MAX_DECIMALS)}, ${this.rot[2].toFixed(
			MAX_DECIMALS
		)}, ${this.rot[3].toFixed(MAX_DECIMALS)}, ${this.rot[0].toFixed(MAX_DECIMALS)}deg);
                animation-duration: ${this.totalFrames / FRAME_RATE}s;
                animation-iteration-count: infinite;
                animation-direction: normal;
                animation-name: b_${this.index}_a;
            }

            @keyframes b_${this.index}_a {
                ${keyframes}
            }

            .b_f_${this.index} {
                position: absolute;
                border: 1px solid black;
            }

            .b_f_${this.index}_f,
            .b_f_${this.index}_ba {
                width: ${this.size.x.toFixed(MAX_DECIMALS)}px;
                height: ${this.size.y.toFixed(MAX_DECIMALS)}px;
            }

            .b_f_${this.index}_r,
            .b_f_${this.index}_l {
                width: ${this.size.z.toFixed(MAX_DECIMALS)}px;
                height: ${this.size.y.toFixed(MAX_DECIMALS)}px;
                left: ${(this.size.x / 2 - this.size.z / 2).toFixed(MAX_DECIMALS)}px;
            }

            .b_f_${this.index}_t,
            .b_f_${this.index}_bo {
                width: ${this.size.x.toFixed(MAX_DECIMALS)}px;
                height: ${this.size.z.toFixed(MAX_DECIMALS)}px;
                top: ${(this.size.y / 2 - this.size.z / 2).toFixed(MAX_DECIMALS)}px;
            }

            .b_f_${this.index}_f  { background: ${
			this.faceColors[0]
		}; transform: rotateY(  0deg) translateZ(${(this.size.z / 2).toFixed(MAX_DECIMALS)}px); }
            .b_f_${this.index}_r  { background: ${
			this.faceColors[3]
		}; transform: rotateY( 90deg) translateZ(${(this.size.x / 2).toFixed(MAX_DECIMALS)}px); }
            .b_f_${this.index}_ba   { background: ${
			this.faceColors[2]
		}; transform: rotateY(180deg) translateZ(${(this.size.z / 2).toFixed(MAX_DECIMALS)}px); }
            .b_f_${this.index}_l   { background: ${
			this.faceColors[1]
		}; transform: rotateY(-90deg) translateZ(${(this.size.x / 2).toFixed(MAX_DECIMALS)}px); }
            .b_f_${this.index}_t    { background: ${
			this.faceColors[4]
		}; transform: rotateX( 90deg) translateZ(${(this.size.y / 2).toFixed(MAX_DECIMALS)}px); }
            .b_f_${this.index}_bo { background: ${
			this.faceColors[5]
		}; transform: rotateX(-90deg) translateZ(${(this.size.y / 2).toFixed(MAX_DECIMALS)}px); }

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
