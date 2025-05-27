import { AxesHelper, BoxGeometry, Color, GridHelper, MathUtils, Mesh, MeshBasicMaterial, OrthographicCamera, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { Resizer } from './resizer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Document2D } from './documents/Document2D';
import type { IDocument } from './documents/IDocument';
import { Document3D } from './documents/Document3D';
import { CreateWallCommand } from './commands/CreateWallCommand';


class Viewer {
    container;
    renderer;
    document2D: Document2D;
    document3D: Document3D;
    private walls: Vector3[] = [];

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
        // Convert 2D coordinates (XY) to 3D XZ plane
        const start3D = new Vector3(start.x, 0, start.y); // Y becomes Z
        const end3D = new Vector3(end.x, 0, end.y);       // Y becomes Z
        this.walls.push(start3D, end3D);
        this.syncWallsTo3D();
    }
    private syncWallsTo3D() {
        // Clear existing 3D walls
        this.document3D.clearWalls();

        // Create 3D representations
        for (let i = 0; i < this.walls.length; i += 2) {
            const start = this.walls[i];
            const end = this.walls[i + 1];
            this.document3D.create3DWall(start, end);
        }
    }
    toggleMode(mode: 'create' | 'select') {
        this.document2D.toggleMode(mode);
    }
}

export { Viewer };