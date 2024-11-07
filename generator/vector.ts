const SCALE = 100;

export class Vector3 extends Array {
	constructor(...args: number[]) {
		if (args.length === 1 && typeof args[0] === "number") {
			super(args[0]);
		} else {
			super(args.length);

			for (let i = 0; i < args.length; i++) {
				this[i] = args[i];
			}
		}
	}

	add(other: Vector3) {
		return this.map((e, i) => e + other[i]);
	}

	scale() {
		this[0] *= SCALE;
		this[1] *= SCALE;
		this[2] *= SCALE;

		return this;
	}

	get x() {
		return this[0];
	}

	get y() {
		return this[1];
	}

	get z() {
		return this[2];
	}
}
