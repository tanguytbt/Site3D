import * as THREE from 'three'

// import Stats from 'three/addons/libs/stats.module.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { DragControls } from 'three/addons/controls/DragControls.js'

import { GetData } from './data/get_data.js'
import { TextureLoader } from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'


let stats
let camera, scene

let renderer, composer
let controls, dragControls

let prevCameraX = 0
let prevCameraY = 0
let prevCameraZ = 0
let deltaX = 0
let deltaY = 0
let deltaZ = 0
let clock = new THREE.Clock()

let afterimagePass

let dataArr
let objects = []
let items = []
let textCredit = []


// variables
let title1,
  title2,
  title3,
  credit1,
  zSpeed,
  pSpeed,
  initialWidth,
  initialDepth,
  onMobile

const mouse = new THREE.Vector2(),
  raycaster = new THREE.Raycaster()

let hasDragged = false

getDevice()
getData()

async function getData () {
  dataArr = await GetData()
  //console.log(dataArr)
  setTimeout(() => {
    if (dataArr.length > 0) {
      init()
    }
  }, 1000)
}

function getDevice () {
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    // true for mobile device
    console.log('onMobile')
    onMobile = true
    title1 = 9
    title2 = 7
    title3 = 6
    credit1 = 32
    zSpeed = 0.1
    pSpeed = 0.1
    initialWidth = 8
    initialDepth = 4000
  } else {
    // false for not mobile device
    onMobile = false
    title1 = 16
    title2 = 14
    title3 = 12
    credit1 = 32
    zSpeed = 0.2
    pSpeed = 1
    initialWidth = 4
    initialDepth = 3000
  }
}

function init () {
  const aspect = window.innerWidth / window.innerHeight

  camera = new THREE.PerspectiveCamera(60, aspect, 1, 4000)
  camera.position.z = 4000

  scene = new THREE.Scene()
  scene.add(camera)

  // stats
  // stats = new Stats()
  //document.body.appendChild(stats.dom)


  // renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
  })

  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.querySelector('#webgl').appendChild(renderer.domElement)

  //bg
  scene.background = new THREE.Color(0xffffff)

  // postprocessing
  composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  
  const message1 = [
    ['3D Image Archive', title1],
    ['Template', title2],
    ['HEAD — Pool Numérique, 2023', title3]
  ]

  setTimeout(() => {
    let message = message1
    loadTitle(camera, message)
  }, 10000)

  // launch functions

  addInstancedMesh(scene, dataArr)

  // event listeners
  window.addEventListener('resize', onWindowResize(camera, renderer, composer))
  document.addEventListener('mousemove', onDocumentMouseMove, false);

  document.addEventListener('click', onClick)
}
function onDocumentMouseMove(event) {
  // Update the mouse position relative to the canvas
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize(camera, renderer, composer) {

  const aspect = window.innerWidth / window.innerHeight;

  camera.aspect = aspect;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
  composer.setSize( window.innerWidth, window.innerHeight );
  // controls.handleResize();
}

function loadTitle (camera, message) {
  const loader = new FontLoader()
  loader.load('fonts/Grotesk/Grotesk03_Bold.json', function (font) {
    for (let i = 0; i < message.length; i++) {
      const geometry = new TextGeometry(message[i][0], {
        font: font,
        size: message[i][1],
        height: 0,
        curveSegments: 12,
        bevelEnabled: false,
        bevelThickness: 0,
        bevelSize: 0,
        bevelOffset: 0,
        bevelSegments: 0
      })
      const material = new THREE.MeshBasicMaterial({ color: 0x000000 })
      const text = new THREE.Mesh(geometry, material)

      geometry.computeBoundingBox()
      const xMid =
        -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x)
      const yMid =
        0.5 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y)
      geometry.translate(xMid, -30 * i + 30, -200)

      camera.add(text)

      text.renderOrder = 999
      text.material.depthTest = true
      text.material.depthWrite = true
      text.isMesh = true
      setTimeout(() => {
        text.isMesh = false
      }, 7000)
    }
  }) //end load function
}

// load and display data

function addInstancedMesh (scene, dataArr) {
  for (let i = 1; i < dataArr.length; i++) {
    const texture = new TextureLoader()
    /////// DISPLAY IMAGE
    texture.load(dataArr[i][0], function (texture) {
      const geometry = new THREE.PlaneGeometry(
        texture.image.width,
        texture.image.height,
        30,
        30
      )
      const uniforms = { texture1: { value: texture } }
      //const material = new MeshBasicMaterial({map: texture})
      const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent,
        wireframe: false,
        depthWrite: true,
        depthTest: true,
        transparent: true,
        opacity: 1
      })

      geometry.computeBoundingBox()
      geometry.needsUpdate = true
      const mesh = new THREE.Mesh(geometry, material)

      mesh.position.x = (Math.random() - 0.5) * window.innerWidth * initialWidth
      mesh.position.y =
        (Math.random() - 0.5) * window.innerHeight * initialWidth
      mesh.position.z = 1000 + (Math.random() - 0.5) * initialDepth
      mesh.scale.x = mesh.scale.y = 0.5

      /////// ADD CREDITS
      const font = new FontLoader()

      font.load('fonts/Grotesk/Grotesk03_Bold.json', function (font) {
        let credits

        if (dataArr[i][4] === 'undefined') {
          dataArr[i][4] = ''
        }

        if (dataArr[i][2].length < 2) {
          credits =
            dataArr[i][1] + ' \n' + dataArr[i][3] + ' \n' + dataArr[i][4]
          console.log('wo')
        } else if (dataArr[i][2].length <= 2 && dataArr[i][1].length <= 2) {
          credits = dataArr[i][3] + dataArr[i][4]
          console.log('w')
        } else {
          credits =
            dataArr[i][2] +
            '\n' +
            dataArr[i][1] +
            ' \n' +
            dataArr[i][3] +
            ' \n' +
            dataArr[i][4]
        }
        console.log(credits)


        const geometry = new TextGeometry(credits, {
          font: font,
          size: credit1,
          height: 1,
          curveSegments: 12,
          bevelEnabled: false,
          bevelThickness: 0,
          bevelSize: 0,
          bevelOffset: 0,
          bevelSegments: 0
        })
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 })
        const fontMesh = new THREE.Mesh(geometry, material)
    
        geometry.computeBoundingBox()

        const bgGeometry = new THREE.PlaneGeometry(
          geometry.boundingBox.max.x - geometry.boundingBox.min.x + 100,
          geometry.boundingBox.max.y - geometry.boundingBox.min.y + 100,
          30,
          30
        )
        const bgMaterial = new THREE.MeshBasicMaterial({ color: 0xfafafa, depthWrite: true, depthTest: true })
        const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial)
        bgGeometry.computeBoundingBox()

        const xMid =
          -0.5 *
          (bgMesh.geometry.boundingBox.max.x -
            bgMesh.geometry.boundingBox.min.x)
        const yMid =
          0.5 *
          (bgMesh.geometry.boundingBox.max.y -
            bgMesh.geometry.boundingBox.min.y)

        // position bgMesh so it is always centered with the bottom right corner of mesh
        const meshSize = new THREE.Vector3()

        mesh.geometry.computeBoundingBox()
        mesh.geometry.boundingBox.getSize(meshSize)

        const meshBottomRight = new THREE.Vector3().copy(mesh.position)
        meshBottomRight.x = meshSize.x / 2
        meshBottomRight.y = meshSize.y / 2

        bgMesh.position.copy(meshBottomRight)

        bgMesh.position.x = mesh.geometry.parameters.width / 2
        bgMesh.position.y = -mesh.geometry.parameters.height / 2 
        bgMesh.position.z = 60

        fontMesh.position.set(xMid + 40, yMid - 60, 2)

        fontMesh.isMesh = false
        bgMesh.isMesh = false

        bgMesh.add(fontMesh)
        mesh.name = bgMesh.name = 'data[' + i + ']'

        textCredit.push(bgMesh)


        mesh.renderOrder = 1
        bgMesh.renderOrder = 5
        bgMesh.layers.enable(1)
        mesh.layers.enable(1)

        mesh.add(bgMesh)

        objects.push([mesh, bgMesh])
        items.push(mesh)

        scene.add(mesh)
      })
    })
  }

  // drag controls

  dragControls = new DragControls(items, camera, renderer.domElement)
  dragControls.addEventListener('drag', render)

  dragControls.addEventListener('drag', function (event) {
    hasDragged = true
  })

  createControls(camera)
  animate()
}

function onClick (event) {
  if (hasDragged) {
    hasDragged = false
    return
  }
  event.preventDefault()

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  raycaster.layers.set(1)

  const intersections = raycaster.intersectObjects(items, true)

  if (intersections.length > 0 && intersections[0].distance <= 4000) {
    console.log('click')
    const object = intersections[0].object

    if (
      object.children[0] !== undefined &&
      object.children[0].children[0] !== undefined
    ) {
      object.children[0].isMesh = !object.children[0].isMesh
      object.children[0].children[0].isMesh = object.children[0].isMesh
    } else {
      object.isMesh = !object.isMesh
      object.children[0].isMesh = object.isMesh
    }
    object.parent.attach(object)
  }
}

function createControls (camera) {
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableRotate = false
  controls.enablePan = true
  controls.enableZoom = true
  controls.zoomSpeed = zSpeed
  controls.minDistance = 0
  controls.panSpeed = pSpeed
  controls.enableDamping = true
  controls.dampingFactor = 0.0075
}

/////// ANIMATE

function animate () {
  requestAnimationFrame(animate)
  const time = performance.now() * 0.0005

  for (let i = 1, l = objects.length; i < l; i++) {
    let object = objects[i][0]
    object.position.y += Math.sin((i + time) / 20) * 0.06
    object.position.x += Math.sin((i + time) / 30) * 0.06
  }

  checkCameraPos()
  controls.update()
  render()
  
}

function checkCameraPos () {
  deltaX += camera.position.x - prevCameraX
  deltaY += camera.position.y - prevCameraY
  deltaZ += camera.position.z - prevCameraZ

  prevCameraX = camera.position.x
  prevCameraY = camera.position.y
  prevCameraZ = camera.position.z

  if (Math.abs(deltaX) > window.innerWidth) {
    addObjects()
    deltaX = 0
  }
  if (Math.abs(deltaY) > window.innerHeight * 1.5) {
    addObjects()
    deltaY = 0
  }
  if (Math.abs(deltaZ) > 5000) {
    addObjects()
    deltaZ = 0
  }
}

const frustum = new THREE.Frustum()
const cameraViewProjectionMatrix = new THREE.Matrix4()

// clone the objects and add them to the scene
function addObjects () {
  for (var i = 0; i < 15; i++) {
    const randomObj = Math.floor(Math.random() * objects.length)
    var clonedObject = objects[randomObj][0].clone()
    scene.add(clonedObject)

    clonedObject.position.set(
      camera.position.x + (Math.random() - 0.5) * window.innerWidth * 6,
      camera.position.y + (Math.random() - 0.5) * window.innerHeight * 2,
      camera.position.z + (Math.random() - 0.5) * 10000
    )
    clonedObject.children[0].isMesh = false
    clonedObject.children[0].children[0].isMesh = false
    items.push(clonedObject)
    clonedObject.name = 'clonedData['
    const index = items.indexOf(clonedObject)
    objects.push([clonedObject, clonedObject.children[0]])

    //set the name of the cloned object and its text to clonedData[index]
    clonedObject.name = 'clonedData[' + index + ']'
    clonedObject.children[0].name = 'clonedData[' + index + ']'
    textCredit.push(clonedObject.children[0])
  }
}

function updateFrustumCulling () {
  cameraViewProjectionMatrix.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  )
  frustum.setFromProjectionMatrix(cameraViewProjectionMatrix)

  for (let i = 0; i < scene.children.length; i++) {
    const mesh = scene.children[i]
    if (mesh.type === 'Mesh') {
      mesh.visible = frustum.intersectsObject(mesh)
    }
  }
}

/////// RENDER
function render () {
  updateFrustumCulling()
  // console.log(
  //   scene.children.length + ' : ' + scene.children.filter(c => c.visible).length
  // )
  let deltaTime = clock.getDelta()
  controls.update(deltaTime)
  composer.render()
}
