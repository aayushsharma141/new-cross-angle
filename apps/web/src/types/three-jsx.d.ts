import { Object3DNode } from "@react-three/fiber";
import { Mesh, BoxGeometry, MeshPhysicalMaterial, OctahedronGeometry, TorusKnotGeometry, MeshStandardMaterial, AmbientLight, SpotLight, Group, PlaneGeometry } from "three";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            mesh: Object3DNode<Mesh, typeof Mesh>;
            boxGeometry: Object3DNode<BoxGeometry, typeof BoxGeometry>;
            meshPhysicalMaterial: Object3DNode<MeshPhysicalMaterial, typeof MeshPhysicalMaterial>;
            octahedronGeometry: Object3DNode<OctahedronGeometry, typeof OctahedronGeometry>;
            torusKnotGeometry: Object3DNode<TorusKnotGeometry, typeof TorusKnotGeometry>;
            meshStandardMaterial: Object3DNode<MeshStandardMaterial, typeof MeshStandardMaterial>;
            ambientLight: Object3DNode<AmbientLight, typeof AmbientLight>;
            spotLight: Object3DNode<SpotLight, typeof SpotLight>;
            group: Object3DNode<Group, typeof Group>;
            planeGeometry: Object3DNode<PlaneGeometry, typeof PlaneGeometry>;
        }
    }
}
