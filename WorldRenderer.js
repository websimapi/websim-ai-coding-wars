import React, { useRef, useEffect, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const WorldRenderer = forwardRef(({ chunks, selectedChunk, onChunkClick, onChunkClaim }, ref) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const chunksRef = useRef(new Map());
    const controlsRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0a);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controlsRef.current = controls;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Grid
        const gridHelper = new THREE.GridHelper(100, 100, 0x444444, 0x222222);
        scene.add(gridHelper);

        // Raycaster for chunk selection
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onMouseClick = (event) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {
                const chunk = intersects[0].object.userData;
                if (chunk) {
                    onChunkClick({ x: chunk.x, y: chunk.y });
                }
            }
        };

        renderer.domElement.addEventListener('click', onMouseClick);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        const handleResize = () => {
            if (!mountRef.current) return;
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.domElement.removeEventListener('click', onMouseClick);
            renderer.dispose();
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    useEffect(() => {
        if (!sceneRef.current) return;

        // Update chunks visualization
        chunks.forEach(chunk => {
            const key = `${chunk.x},${chunk.y}`;
            let mesh = chunksRef.current.get(key);

            if (!mesh) {
                const geometry = new THREE.BoxGeometry(0.9, 0.5, 0.9);
                const material = new THREE.MeshLambertMaterial({
                    color: chunk.owner ? 0x00ff00 : 0x666666
                });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(chunk.x, 0.25, chunk.y);
                mesh.userData = chunk;
                sceneRef.current.add(mesh);
                chunksRef.current.set(key, mesh);
            } else {
                mesh.material.color.setHex(chunk.owner ? 0x00ff00 : 0x666666);
            }

            // Add units visualization
            mesh.children.forEach(child => sceneRef.current.remove(child));
            chunk.units?.forEach((unit, index) => {
                const unitGeometry = new THREE.SphereGeometry(0.15, 8, 8);
                const unitMaterial = new THREE.MeshLambertMaterial({
                    color: unit.owner === chunk.owner ? 0x00ffff : 0xff0000
                });
                const unitMesh = new THREE.Mesh(unitGeometry, unitMaterial);
                unitMesh.position.set(
                    (Math.random() - 0.5) * 0.5,
                    0.5,
                    (Math.random() - 0.5) * 0.5
                );
                mesh.add(unitMesh);
            });
        });
    }, [chunks]);

    return <div ref={mountRef} className="w-full h-full" />;
});

