// Don't use window.onLoad like this in production, because it can only listen to one function.
window.onload = function() {
  var eventsHandler;

  eventsHandler = {
    haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel']
  , init: function(options) {
      var instance = options.instance
        , initialScale = 1
        , pannedX = 0
        , pannedY = 0

      // Init Hammer
      // Listen only for pointer and touch events
      this.hammer = Hammer(options.svgElement, {
        inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
      })

      // Enable pinch
      this.hammer.get('pinch').set({enable: true})

      // Handle double tap
      this.hammer.on('doubletap', function(ev){
        instance.zoomIn()
      })

      // Handle pan
      this.hammer.on('panstart panmove', function(ev){
        // On pan start reset panned variables
        if (ev.type === 'panstart') {
          pannedX = 0
          pannedY = 0
        }

        // Pan only the difference
        instance.panBy({x: ev.deltaX - pannedX, y: ev.deltaY - pannedY})
        pannedX = ev.deltaX
        pannedY = ev.deltaY
      })

      // Handle pinch
      this.hammer.on('pinchstart pinchmove', function(ev){
        // On pinch start remember initial zoom
        if (ev.type === 'pinchstart') {
          initialScale = instance.getZoom()
          instance.zoomAtPoint(initialScale * ev.scale, {x: ev.center.x, y: ev.center.y})
        }

        instance.zoomAtPoint(initialScale * ev.scale, {x: ev.center.x, y: ev.center.y})
      })

      // Prevent moving the page on some devices when panning over SVG
      options.svgElement.addEventListener('touchmove', function(e){ e.preventDefault(); });
    }

  , destroy: function(){
      this.hammer.destroy()
    }
  }

  let building = document.getElementById('my-embed')

  window.panZoom = svgPanZoom(building, {
    zoomEnabled: true,
    controlIconsEnabled: true,
    fit: 1,
    center: 1,
    maxZoom: 5,
    customEventsHandler: eventsHandler
    });


  // encodedLayers = ['ramp', 'disabled-toilet', 'support-center']

  layerColorMap = {
    'ramp': "#785EF0",
    'support-center': "#DC267F",
    'disabled-toilet': "#648FFF"
  }


  layerTags = ['ramp', 'support-center', 'disabled-toilet']

  const checkboxes = document.querySelectorAll("input[type='checkbox']")

  Array.from(checkboxes).forEach(checkbox=>{
    checkbox.addEventListener('change',()=>{
      toggle(getLayerStates(), layerColorMap)
    })
  })

  function getLayerStates() {
    const layerMap = {}
    Array.from(checkboxes).forEach((checkbox)=>{
      const layerId = checkbox.dataset.layerId;
      if (checkbox.checked) {
        layerMap[layerId] = true
      } else {
        layerMap[layerId] = false
      }
    })
    return layerMap
  }

  function toggle(layerStateMap, colorMap) {
    const svgDom = building.getSVGDocument()
    const allLayers = svgDom.querySelectorAll("[layer-type]")
    allLayers.forEach((layer)=>{
      layer.style.fill = ""
    })
    allLayers.forEach((layer)=>{
        const layerId = layer.getAttribute('layer-type')
        if (layerStateMap[layerId]==true) {
          layer.style.fill = colorMap[layerId]
        }
    })
  }
  
};