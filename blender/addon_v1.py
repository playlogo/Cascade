import bpy
import os
import math

bl_info = {
    "name": "Export Cube Data",
    "category": "Object",
}


class ExportCubeDataPreferences(bpy.types.AddonPreferences):
    bl_idname = __name__
    last_file_path: bpy.props.StringProperty(
        name="Last File Path", subtype="FILE_PATH", default=""
    )

    def draw(self, context):
        layout = self.layout
        layout.prop(self, "last_file_path")


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
            obj.rotation_mode = "AXIS_ANGLE"
            rotation = obj.rotation_axis_angle

            # Collect face colors with consistent face order
            face_normals = {
                (1, 0, 0): None,  # +X
                (-1, 0, 0): None,  # -X
                (0, 1, 0): None,  # +Y
                (0, -1, 0): None,  # -Y
                (0, 0, 1): None,  # +Z
                (0, 0, -1): None,  # -Z
            }
            for face in mesh.polygons:
                # Round normal vector to handle floating point precision
                normal = tuple(round(c) for c in face.normal)
                # Get material index
                mat_index = face.material_index

                if mat_index > len(mesh.materials):
                    # No material assigned to face, use default one
                    color = (1.0, 1.0, 1.0, 1.0)
                else:
                    # Get material of face
                    mat = mesh.materials[mat_index]

                    if not mat.use_nodes:
                        # TODO: Add support for non-node based materials
                        color = (1.0, 1.0, 1.0, 1.0)
                    else:
                        # Traverse material nodes to find color from principled bsdf node
                        color = (1.0, 1.0, 1.0, 1.0)
                        for node in mat.node_tree.nodes:
                            if node.type == "BSDF_PRINCIPLED":
                                color = node.inputs["Base Color"].default_value[:]
                face_normals[normal] = color

            # Collect colors in predefined order
            face_colors_extracted = []
            for normal in [
                (1, 0, 0),  # +X
                (-1, 0, 0),  # -X
                (0, 1, 0),  # +Y
                (0, -1, 0),  # -Y
                (0, 0, 1),  # +Z
                (0, 0, -1),  # -Z
            ]:
                color = face_normals.get(normal, (1.0, 1.0, 1.0, 1.0))
                face_colors_extracted.append(color)

            # Store cube
            cube_data.append(
                {
                    "name": obj.name,
                    "location": location,
                    "scale": scale,
                    "rotation": rotation,
                    "face_colors": face_colors_extracted,
                }
            )

        # Write cubes to file
        with open(self.filepath, "w") as f:
            f.write('# {"origin": "blender", "version": 2} \n')

            # Store camera position & rotation if available
            if context.scene.camera:
                camera = context.scene.camera

                cam_loc = camera.location
                cam_rot = camera.rotation_euler
                f.write(
                    f"camera {cam_loc.x} {cam_loc.y} {cam_loc.z} {cam_rot.x} {cam_rot.y} {cam_rot.z}\n\n"
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
                    f"box {loc.x} {loc.y} {loc.z} {scale.x} {scale.y} {scale.z} {rot[0]} {rot[1]} {rot[2]} {rot[3]} "
                )
                f.write(" ".join(colors_hex))
                f.write("\n")

        # Save the file path to preferences
        prefs = context.preferences.addons[__name__].preferences
        prefs.last_file_path = self.filepath

        self.report({"INFO"}, "Successfully exported scene")

        return {"FINISHED"}

    def invoke(self, context, event):
        prefs = context.preferences.addons[__name__].preferences
        if prefs.last_file_path:
            self.filepath = prefs.last_file_path
            return self.execute(context)
        else:
            context.window_manager.fileselect_add(self)
            return {"RUNNING_MODAL"}

    def radToDeg(self, rotation_euler):
        return math.degrees(rotation_euler)


def menu_func(self, context):
    self.layout.operator(ExportCubeDataOperator.bl_idname)


addon_keymaps = []


def register():
    bpy.utils.register_class(ExportCubeDataPreferences)
    bpy.utils.register_class(ExportCubeDataOperator)
    bpy.types.TOPBAR_MT_file_export.append(menu_func)

    # Register keyboard shortcut
    wm = bpy.context.window_manager
    km = wm.keyconfigs.addon.keymaps.new(name="Window", space_type="EMPTY")
    kmi = km.keymap_items.new(
        ExportCubeDataOperator.bl_idname, "E", "PRESS", ctrl=True, shift=True
    )
    addon_keymaps.append((km, kmi))


def unregister():
    bpy.utils.unregister_class(ExportCubeDataPreferences)
    bpy.utils.unregister_class(ExportCubeDataOperator)
    bpy.types.TOPBAR_MT_file_export.remove(menu_func)

    # Unregister keyboard shortcut
    for km, kmi in addon_keymaps:
        km.keymap_items.remove(kmi)
    addon_keymaps.clear()


if __name__ == "__main__":
    register()
