bl_info = {
    "name": "Extract Keyframes",
    "author": "Your Name",
    "version": (1, 0, 0),
    "blender": (2, 80, 0),
    "location": "View3D > Object",
    "description": "Extracts all keyframes for all objects in the scene",
    "category": "Animation",
}

import bpy
import json


class ExtractKeyframesOperator(bpy.types.Operator):
    bl_idname = "object.extract_keyframes"
    bl_label = "Extract Keyframes"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        data = {}
        scene = context.scene
        for obj in scene.objects:
            if obj.animation_data and obj.animation_data.action:
                keyframes = []
                frames = set()
                for fcurve in obj.animation_data.action.fcurves:
                    for kp in fcurve.keyframe_points:
                        frames.add(int(kp.co.x))
                for frame in sorted(frames):
                    scene.frame_set(frame)
                    loc = obj.location.copy()
                    rot = (
                        obj.rotation_quaternion.copy()
                        if obj.rotation_mode == "QUATERNION"
                        else obj.rotation_euler.to_quaternion()
                    )
                    scale = obj.scale.copy()
                    keyframe_data = {
                        "frame": frame,
                        "loc": [loc.x, loc.y, loc.z],
                        "rot": [rot.w, rot.x, rot.y, rot.z],
                        "scale": [scale.x, scale.y, scale.z],
                    }
                    keyframes.append(keyframe_data)
                data[obj.name] = keyframes
        print(json.dumps(data, indent=4))
        return {"FINISHED"}


def menu_func(self, context):
    self.layout.operator(ExtractKeyframesOperator.bl_idname)


def register():
    bpy.utils.register_class(ExtractKeyframesOperator)
    bpy.types.VIEW3D_MT_object.append(menu_func)


def unregister():
    bpy.utils.unregister_class(ExtractKeyframesOperator)
    bpy.types.VIEW3D_MT_object.remove(menu_func)


if __name__ == "__main__":
    register()
