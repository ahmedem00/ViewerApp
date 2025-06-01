import { AxesHelper, BoxGeometry, Color, GridHelper, MathUtils, Mesh, MeshBasicMaterial, OrthographicCamera, PerspectiveCamera, Scene, Vector2, Vector3, WebGLRenderer } from 'three';
import { Resizer } from './resizer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Document2D } from './documents/Document2D';
import type { IDocument } from './documents/IDocument';
import { Document3D } from './documents/Document3D';
import { CreateWallCommand } from './commands/CreateWallCommand';

interface Wall {
    type: 'wall';
    start: Vector3;
    end: Vector3;
    angle: number;
    length: number;
}
class Viewer {
    container;
    renderer;
    document2D: Document2D;
    document3D: Document3D;
    private walls: Wall[] = []; // Replace the old walls array with this

    activeDocument: IDocument;
    constructor(container: HTMLElement) {
        this.container = container;

        this.renderer = this.createRenderer();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.append(this.renderer.domElement);
        this.document2D = new Document2D(this.renderer.domElement, this);
        // this.document2D=new Document2D(this.renderer.domElement);
        this.document3D = new Document3D(this.renderer.domElement);
        this.activeDocument = this.document2D;
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.querySelector("#toggleModeBtn")?.addEventListener("click", () => {
            const currentMode = this.document2D["activeCommand"] instanceof CreateWallCommand
                ? 'create' : 'select';
            this.toggleMode(currentMode === 'create' ? 'select' : 'create');
        });
        document.querySelector('#modeRoomBtn')?.addEventListener('click', () => {
  this.setDrawingMode('room');
});
    }
    setDrawingMode(mode: 'wall' | 'room') {
        this.document2D.setDrawingMode(mode);
    }
    render() {
        this.activeDocument.render(this.renderer);
    }
    setView(type: string) {
        if (type == '2d') {
            this.activeDocument = this.document2D;
        } else {
            this.activeDocument = this.document3D;
        }
    }

    createRenderer() {
        var renderer = new WebGLRenderer({ antialias: true });
        return renderer;
    }

    animate() {
        this.render();
        requestAnimationFrame(this.animate.bind(this));
    }

    onMouseDown(e: MouseEvent) {
        if (this.activeDocument === this.document2D) {
            this.activeDocument.onMouseDown(e);
        }
    }
    onMouseUp(e: MouseEvent) {
        if (this.activeDocument === this.document2D) {
            this.activeDocument.onMouseUp(e);
        }
    }
    onMouseMove(e: MouseEvent) {
        if (this.activeDocument === this.document2D) {
            this.activeDocument.onMouseMove(e);
        }
    }
    zoomFit() {
        this.activeDocument.zoomFit();
    }
      addWall(start: Vector3, end: Vector3) {
        const wallVec = new Vector2(end.x - start.x, end.y - start.y);
        const length = wallVec.length();
        const angle = Math.atan2(wallVec.y, wallVec.x);
        
        const wall: Wall = {
            type: 'wall',
            start: new Vector3(start.x, 0, start.y), // Convert to 3D coordinates (XZ plane)
            end: new Vector3(end.x, 0, end.y),      // Convert to 3D coordinates (XZ plane)
            angle,
            length
        };
        
        this.walls.push(wall);
        this.syncWallsTo3D();
    }
    private syncWallsTo3D() {
        // Clear existing 3D walls
         this.document3D.clearWalls();
        this.walls.forEach(wall => {
            this.document3D.create3DWall(wall);
        });
    }
    toggleMode(mode: 'create' | 'select') {
        this.document2D.toggleMode(mode);
    }
}

export { Viewer };export type { Wall };