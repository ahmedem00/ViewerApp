import {AxesHelper, Box3, BoxGeometry, Color, DirectionalLight, GridHelper, MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, OrthographicCamera, PerspectiveCamera, Plane, Raycaster, RepeatWrapping, Scene, SphereGeometry, TextureLoader, Vector2, Vector3, WebGLRenderer} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { Resizer } from '../resizer';
import type { IDocument } from './IDocument';
import { AmbientLight, HemisphereLight } from 'three';
import type { Wall } from '../Viewer'; 
export class Document3D implements IDocument{
    canvas;
    scene;
    camera;
    controls;
  
    plane:Plane;
    private mouse:Vector2=new Vector2();
    highlighted:any;
    selected:any;
    spheres:any[]=[];
    private ambientLight: AmbientLight;
    private directionalLight: DirectionalLight;
    private hemisphereLight: HemisphereLight;
    constructor(canvas:HTMLElement){
        this.canvas=canvas;
        this.scene=this.createScene();
        this.camera=this.createCamera();
        new Resizer(canvas,this.camera);
        this.controls=this.addControls();
       
        this.addGridHelper();
        // this.rayCaster=new Raycaster();
      
        this.plane=new Plane(new Vector3(0,-1,0),0);
         this.addLights(); 
    }
    
    zoomFit(){
        const box = new Box3().setFromObject(this.scene);
        const size = box.getSize(new Vector3());
        const center = box.getCenter(new Vector3());

        this.camera.position.set(
          center.x,
          center.y + size.y,
          center.z + size.x
        );
        this.camera.lookAt(center);

        this.controls.target.copy(center);
        this.controls.update();
    }
    
    render(renderer:WebGLRenderer){
        this.controls.update();
        renderer.render(this.scene,this.camera);
    }
     private addLights() {
        // Ambient light for general illumination
        this.ambientLight = new AmbientLight(0x404040, 1.5); // Increased intensity
        this.scene.add(this.ambientLight);

        // Main directional light
        this.directionalLight = new DirectionalLight(0xffffff, 1.5);
        this.directionalLight.position.set(10, 20, 10);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(this.directionalLight);

        // Hemisphere light for more natural outdoor lighting
        this.hemisphereLight = new HemisphereLight(0xffffbb, 0x080820, 1);
        this.scene.add(this.hemisphereLight);

        // Optional: Add a second directional light from opposite side
        const fillLight = new DirectionalLight(0xffffff, 0.5);
        fillLight.position.set(-10, 10, -10);
        this.scene.add(fillLight);
    }
    addControls(){
        var controls=new OrbitControls(this.camera,this.canvas);
        controls.enableDamping=true;
        controls.update();
        return controls;
    }
    
    addGridHelper(){
        var grid=new GridHelper(100,100);
        this.scene.add(grid);
        //grid.rotation.x=MathUtils.degToRad(90);
        var axesHelper=new AxesHelper(2);
        this.scene.add(axesHelper);
    }
    createScene(){
        var scene=new Scene();
        scene.background=new Color('Black');
        return scene;
    }
    createCamera(){
       
        const camera=new PerspectiveCamera(45,
            this.canvas.clientWidth/this.canvas.clientHeight,
            .1,
            500
        );
        camera.position.set(50,50,50);
        return camera;
    }
    createRenderer(){
        var renderer=new WebGLRenderer({antialias:true});
        return renderer;
    }
// In Document3D.ts
 create3DWall(wall: Wall) {
        // Calculate horizontal length in XZ plane
        const startXZ = new Vector2(wall.start.x, wall.start.z);
        const endXZ = new Vector2(wall.end.x, wall.end.z);
        const length = startXZ.distanceTo(endXZ);
        const angle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);

        // Wall dimensions
        const height = 3;
        const thickness = 0.2;

        // Load textures
        const textureLoader = new TextureLoader();
        const colorMap = textureLoader.load('/assets/brick_wall/Brick_Wall_017_basecolor.jpg');
        const normalMap = textureLoader.load('/assets/brick_wall/Brick_Wall_017_normal.jpg');
        const displacementMap = textureLoader.load('/assets/brick_wall/Brick_Wall_017_height.png');
        const roughnessMap = textureLoader.load('/assets/brick_wall/Brick_Wall_017_roughness.jpg');
        const aoMap = textureLoader.load('/assets/brick_wall/Brick_Wall_017_ambientOcclusion.jpg');

        // Configure texture repeating
        const repeatX = length / 2;
        const repeatY = height / 2;
        [colorMap, normalMap, displacementMap, roughnessMap, aoMap].forEach(map => {
            map.wrapS = RepeatWrapping;
            map.wrapT = RepeatWrapping;
            map.repeat.set(repeatX, repeatY);
        });

        // Create material with textures - make it more reflective
        const material = new MeshStandardMaterial({
            map: colorMap,
            normalMap: normalMap,
            displacementMap: displacementMap,
            displacementScale: 0.1,
            roughnessMap: roughnessMap,
            roughness: 0.5, // Reduced roughness for more shine
            aoMap: aoMap,
            metalness: 0.3, // Increased metalness for more reflectivity
            envMapIntensity: 0.5 // Add if you have an environment map
        });

        const geometry = new BoxGeometry(length, height, thickness, 50, 50, 1);
        geometry.setAttribute('uv2', geometry.attributes.uv.clone());

        const wallMesh = new Mesh(geometry, material);
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        
        wallMesh.position.set(
            (wall.start.x + wall.end.x) / 2,
            height / 2,
            (wall.start.z + wall.end.z) / 2
        );
        wallMesh.rotation.y = angle;

        this.scene.add(wallMesh);
    }

  // Add cleanup method
  clearWalls() {
    this.scene.children = this.scene.children.filter(
      obj => obj.type !== 'Mesh'
    );
  }
    onMouseDown(e: MouseEvent): void {
  // Empty implementation or basic camera controls
}

onMouseUp(e: MouseEvent): void {
  // Empty implementation
}

onMouseMove(e: MouseEvent): void {
  // Empty implementation or basic hover effects
}
}
