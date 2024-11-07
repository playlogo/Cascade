import bpy
import os
import math

bl_info = {
    "name": "Export Cube Data",
    "category": "Object",
}


class ExportCubeDataOperator(bpy.types.Operator):
    bl_idname = "object.export_cube_data"
    bl_label = "Export Scene for Cascade"

    filepath: bpy.props.StringProperty(subtype="FILE_PATH")
    filename = "shapes.txt"

    def execute(self, context):
        cube_data = []

        # Collect all cubes
        for obj in bpy.context.scene.objects:
            # Check if object is a mesh
            if not obj.type == "MESH":
                continue

            mesh = obj.data

            # Check if object is a cube
            if not (
                len(mesh.polygons) == 6
                and len(mesh.vertices) == 8
                and len(mesh.edges) == 12
            ):
                continue

            location = obj.location.copy()
            scale = obj.scale.copy()
            rotation = obj.rotation_axis_angle

            # Collect face colors
            face_colors_extracted = []
            for face in mesh.polygons:
                # Get material index (in blender every face can have a different material from a per object material list)
                mat_index = face.material_index

                if mat_index > len(mesh.materials):
                    # No material assigned to face, use default one
                    face_colors_extracted.append((1.0, 1.0, 1.0, 1.0))
                    continue

                # Get material of face
                mat = mesh.materials[mat_index]

                if not mat.use_nodes:
                    # TODO: Add support for non-node based materials
                    face_colors_extracted.append((1.0, 1.0, 1.0, 1.0))
                    continue

                # Traverse material nodes to find color from principled bsdf node
                color = (1.0, 1.0, 1.0, 1.0)
                for node in mat.node_tree.nodes:
                    if node.type == "BSDF_PRINCIPLED":
                        color = node.inputs["Base Color"].default_value[:]
                face_colors_extracted.append(color)

            # Remap colors
            face_colors = [0, 0, 0, 0, 0, 0]
            face_colors[3] = face_colors_extracted[5]  # Flip right and bottom
            face_colors[5] = face_colors_extracted[3]

            face_colors[4] = face_colors_extracted[0]  # Flip front and top
            face_colors[0] = face_colors_extracted[4]

            face_colors[1] = face_colors_extracted[1]  # Back and left stay the same
            face_colors[2] = face_colors_extracted[2]

            # Store cube
            cube_data.append(
                {
                    "name": obj.name,
                    "location": location,
                    "scale": scale,
                    "rotation": rotation,
                    "face_colors": face_colors,
                }
            )

        # Write cubes to file
        with open(self.filepath, "w") as f:
            f.write('# {"origin": "blender", "version": 1} \n')

            # Store camera position & rotation if available
            if context.scene.camera:
                camera = context.scene.camera

                cam_loc = camera.location
                cam_rot = camera.rotation_euler
                f.write(
                    f"camera {cam_loc.y} {cam_loc.z} {cam_loc.x} {cam_rot.y} {cam_rot.z} {cam_rot.x}\n\n"
                )

            # Store cubes
            for cube in cube_data:
                loc = cube["location"]
                scale = cube["scale"]
                rot = cube["rotation"]
                colors = cube["face_colors"]
                colors_hex = []

                # Convert colors to hex
                for color in colors:
                    r, g, b, a = color
                    hex_color = "#{:02x}{:02x}{:02x}{:02x}".format(
                        int(r * 255), int(g * 255), int(b * 255), int(a * 255)
                    )
                    colors_hex.append(hex_color)

                # Store cube
                f.write(
                    f"box {-loc.y} {-loc.z} {-loc.x} {scale.y} {scale.z} {scale.x} {self.radToDeg(rot[0])} {-rot[2]} {rot[3]} {-rot[1]} "
                )
                f.write(" ".join(colors_hex))
                f.write("\n")

        self.report({"INFO"}, "Successfully exported scene")

        return {"FINISHED"}

    def invoke(self, context, event):
        context.window_manager.fileselect_add(self)
        return {"RUNNING_MODAL"}

    def radToDeg(self, rotation_euler):
        return math.degrees(rotation_euler)


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
