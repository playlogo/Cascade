import bpy
import os
import math

bl_info = {
    "name": "Export Cube Data",
    "category": "Object",
}


class ExportCubeDataOperator(bpy.types.Operator):
    bl_idname = "object.export_cube_data"
    bl_label = "Export Cube Data"

    filepath: bpy.props.StringProperty(subtype="FILE_PATH")

    def execute(self, context):
        cube_data = []

        for obj in bpy.context.scene.objects:
            if obj.type == "MESH":
                mesh = obj.data
                # Check if the mesh is an unmodified cube
                if (
                    len(mesh.polygons) == 6
                    and len(mesh.vertices) == 8
                    and len(mesh.edges) == 12
                ):
                    location = obj.location.copy()
                    scale = obj.scale.copy()
                    rotation = obj.rotation_euler.copy()
                    face_colors = []
                    for face in mesh.polygons:
                        mat_index = face.material_index
                        if mat_index < len(mesh.materials):
                            mat = mesh.materials[mat_index]
                            if mat and mat.use_nodes:
                                # For node-based materials, get the Principled BSDF node's Base Color
                                color = (1.0, 1.0, 1.0, 1.0)
                                for node in mat.node_tree.nodes:
                                    if node.type == "BSDF_PRINCIPLED":
                                        color = node.inputs["Base Color"].default_value[
                                            :
                                        ]
                                        break
                            elif mat:
                                # For materials not using nodes, get diffuse color
                                color = mat.diffuse_color[:]
                            else:
                                color = (1.0, 1.0, 1.0, 1.0)
                        else:
                            color = (1.0, 1.0, 1.0, 1.0)  # Default color if no material
                        face_colors.append(color)
                    cube_data.append(
                        {
                            "name": obj.name,
                            "location": location,
                            "scale": scale,
                            "rotation": rotation,
                            "face_colors": face_colors,
                        }
                    )
        # Format data and write to file
        with open(self.filepath, "w") as f:
            f.write("# type: camera posX posY posZ rotX rotY rotZ\n")
            camera = context.scene.camera
            if camera:
                cam_loc = camera.location
                cam_rot = camera.rotation_euler
                f.write(
                    f"camera {cam_loc.y} {cam_loc.z} {cam_loc.x} {cam_rot.y} {cam_rot.z} {cam_rot.x}\n\n"
                )
            for cube in cube_data:
                loc = cube["location"]
                scale = cube["scale"]
                rot = cube["rotation"]
                colors = cube["face_colors"]
                colors_hex = []
                for color in colors:
                    r, g, b, a = color
                    hex_color = "#{:02x}{:02x}{:02x}{:02x}".format(
                        int(r * 255), int(g * 255), int(b * 255), int(a * 255)
                    )
                    colors_hex.append(hex_color)
                f.write(
                    "# type: box posX posY posZ sizeX sizeY sizeZ rotX rotY rotZ colorFrontFace colorLeftFace colorBackFace colorRightFace colorUpFace colorDownFace\n"
                )
                f.write(
                    f"box {loc.y} {loc.z} {loc.x} {scale.y} {scale.z} {scale.x} {self.radToDeg(rot.y)} {self.radToDeg(rot.z)} {self.radToDeg(rot.x)} "
                )
                f.write(" ".join(colors_hex))
                f.write("\n\n")
        self.report({"INFO"}, "Cube data exported successfully.")
        return {"FINISHED"}

    def invoke(self, context, event):
        context.window_manager.fileselect_add(self)
        return {"RUNNING_MODAL"}

    def radToDeg(self, euler):
        return math.degrees(euler)


def menu_func(self, context):
    self.layout.operator(ExportCubeDataOperator.bl_idname)


def register():
    bpy.utils.register_class(ExportCubeDataOperator)
    bpy.types.TOPBAR_MT_file_export.append(menu_func)


def unregister():
    bpy.utils.unregister_class(ExportCubeDataOperator)
    bpy.types.TOPBAR_MT_file_export.remove(menu_func)


if __name__ == "__main__":
    register()
