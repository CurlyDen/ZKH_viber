var cnt = 1;
var cnt_link = 1;
link_mode = false;
let selectedElement = null;

// svg field
link = document.createElementNS("http://www.w3.org/2000/svg", "svg");
link.innerHTML = '<defs><marker id="arrowhead" markerWidth="10" markerHeight="7"  refX="0" refY="3.5" orient="auto"> <polygon points="0 0, 10 3.5, 0 7" /></marker></defs>';
link.style.position = "absolute";
link.style.zIndex = 9999;
link.style.pointerEvents = "none";
link.style.overflow = "visible";

// memory
nodes = {};
links = {};

// link button init
function link_btn_init(){
  link_btn = document.createElement('button');
  link_btn.classList.add("link_btn");
  link_btn.innerHTML = '/';
  link_btn.onmousedown = function(event){
    createLink(event);
  };
  return link_btn
}

// unlink button
function to_unlink_btn(link_btn){
  link_btn.innerHTML = '-';
  link_btn.onmousedown = function(event){
    papa = event.target.parentNode;
    console.log(papa);
    if (papa.classList.contains('message')){
      line = document.getElementById(nodes[papa.parentNode.id.slice(5)]['to'][0]);
      if (papa.parentNode.id.slice(5) > 0) papa.parentNode.getElementsByClassName('add_btn')[0].style.display = "flex";
    } else line = document.getElementById(papa.id.slice(3));
    removeElement(line);
  };
}

// unlink button
function to_link_btn(link_btn){
  link_btn.innerHTML = '/';
  link_btn.onmousedown = function(event){
    createLink(event);
  };
}

window.onload = function() {
  diagram = document.body;
  
  // start block
  const m_start = document.getElementById('m_start');
  m_start.appendChild(link_btn_init());
  nodes[-1] = {'to':[], 'from':[]};
  start = m_start.parentElement;
  start.onmousedown = function(event) {
    startDragging(event);
    highlight(event);
  }
  // end block
  nodes[-2] = {'to':[], 'from':[]};
  const end = document.getElementById('block-2');
  end.onmousedown = function(event) {
    startDragging(event);
    highlight(event);
  }

  // load scenario
  data = JSON.parse(document.getElementById('data').textContent);
  console.log(data);
  // load blocks
  for (block_id in data['blocks']) {
    x = JSON.parse(data['blocks'][block_id]['coords']).left;
    y = JSON.parse(data['blocks'][block_id]['coords']).top;
    if (block_id > 0) {
      createBlock(x, y, diagram, data['blocks'][block_id]['text'], block_id);
      if (block_id >= cnt) cnt = block_id * 1 + 1;
    } else {
      block = document.getElementById('block' + block_id);
      block.style.left = `${x}px`;
      block.style.top = `${y}px`;
    }
    nodes[block_id] = {'to':[], 'from':[]};
  }
  // load keys and links
  for (link_id in data['links']) {
    link_line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    link_line.classList.add('link-line');
    link_line.id = link_id;

    st_id = 'block' + data['links'][link_id]['start'];
    en_id = 'block' + data['links'][link_id]['end'];
    start_bl = document.getElementById(st_id);
    end_bl = document.getElementById(en_id);
    sc = getCoords(start_bl.getElementsByClassName('message')[0]);
    ec = getCoords(end_bl.getElementsByClassName('message')[0]);
    // if link between 2 blocks
    if (link_id < 0) {
      y1 = sc.top + sc.height / 2;
      to_unlink_btn(start_bl.getElementsByClassName('message')[0].getElementsByClassName('link_btn')[0]);
      if (data['links'][link_id]['start'] > 0) start_bl.getElementsByClassName('add_btn')[0].style.display = "none";
    } else {
      // if link between key and block
      keys = start_bl.getElementsByClassName('keys')[0];
      keys.parentNode.getElementsByClassName('message')[0].getElementsByClassName('link_btn')[0].style.display = "none";
      key = document.createElement('div');
      label = document.createElement('input');
      label.value = data['links'][link_id]['text'];
      label.classList.add('label');
      key.classList.add('key');
      key.id = 'key' + link_id;
      label.type = 'text';
      if (link_id > cnt_link) cnt_link = link_id * 1 + 1;

      link_btn_key = link_btn_init();
      to_unlink_btn(link_btn_key);

      key.appendChild(label);
      key.appendChild(link_btn_key);
      keys.appendChild(key);
      k_cords = getCoords(key);
      y1 = k_cords.top + k_cords.height / 2;
    };

    x1 = sc.left + sc.width;
    links[link_id] = [st_id.slice(5), en_id.slice(5)];
    nodes[st_id.slice(5)]['to'].push(link_id);
    nodes[en_id.slice(5)]['from'].push(link_id);
    x2 = ec.left;
    y2 = ec.top + ec.height / 2;
    link_line.setAttribute('x1', `${x1}px`);
    link_line.setAttribute('y1', `${y1}px`);
    link_line.setAttribute('x2', `${x2}px`);
    link_line.setAttribute('y2', `${y2}px`);
    link_line.setAttribute("stroke", "black");
    link_line.setAttribute('marker-end', "url(#arrowhead)")
    link.appendChild(link_line);
    document.body.before(link);
  }

  // Create block button
  const create_btn = document.getElementById('create')
  create_btn.onmousedown = function(event) {
      createBlock(event.clientX, event.clientY, diagram);
      unhighlight(event);
  };
  // Save button
  const save_btn = document.getElementById('save')
  save_btn.onmousedown = function() {
      saveBtn();
  };
  // Highlight
  document.onclick = function(event) {
    highlight(event);
    document.getElementById("contextMenu") .style.display = "none";
  };
  // Context menu
  document.oncontextmenu = function(event) {
    event.preventDefault();
    menu = document.getElementById("contextMenu") 
    unhighlight(event);
    highlight(event);
    if (selectedElement){
      if (menu.style.display == "block"){ 
        menu.style.display = "none" 
      } else {    
        menu.style.display = 'block'; 
        menu.style.left = event.pageX + "px"; 
        menu.style.top = event.pageY + "px"; 
      } 
    } else menu.style.display = "none";
  }
  // Delete key
  document.onkeydown = function(event){
    if (event.key === 'Delete'){
      if (selectedElement && selectedElement.id != 'block-1' && selectedElement.id != 'block-2'){
        removeElement(selectedElement);
      }
    }
  }
  // Delete option on context menu
  document.getElementById('trash').onmousedown = function(event){
    if (selectedElement && selectedElement.id != 'block-1' && selectedElement.id != 'block-2') removeElement(selectedElement)
  }
}


// Create block
function createBlock(x, y, diagram, text='', num=0) {
    const block = document.createElement('div');
    block.classList.add('block');
    if (num == 0) {
      num = cnt;
      cnt++;
    }
    block.id = 'block' + num;
    block.style.left = `${x}px`;
    block.style.top = `${y}px`;

    nodes[`${num}`] = {'to':[], 'from':[]};

    message = document.createElement('div');
    message.classList.add('message');
    message.innerHTML = '<textarea id=text' + num + '>' + text;

    func_inp = document.createElement('input');
    func_inp.type = 'text';
    func_inp.classList.add('func_inp');

    add_btn = document.createElement('button');
    add_btn.classList.add('add_btn');
    add_btn.innerHTML = '+';

    block.appendChild(func_inp);
    message.appendChild(link_btn_init());
    
    // Add keys
    const keys = document.createElement('div');
    keys.classList.add('keys');
    add_btn.onmousedown = function(event){
      event.target.parentNode.getElementsByClassName('message')[0].getElementsByClassName('link_btn')[0].style.display = "none";
      key = document.createElement('div');
      label = document.createElement('input');
      label.classList.add('label');
      key.classList.add('key');
      key.id = 'key' + cnt_link;
      cnt_link++;
      label.type = 'text';

      key.appendChild(label);
      key.appendChild(link_btn_init());
      keys.appendChild(key);
    }
    
    block.appendChild(message);
    block.appendChild(add_btn);
    block.appendChild(keys);
  
    // Start dragging handler
    block.onmousedown = function(event) {
      startDragging(event);
      highlight(event);
    };
    diagram.appendChild(block);
  }
    
// Dragging func
function startDragging(event) {
    const elem = event.target;
    if (elem.classList.contains('message') || elem.classList.contains('keys')) block = elem.parentNode;
    else if (elem.classList.contains('block')) block = elem;
    else return;
    var coords = getCoords(block);
    var shiftX = event.pageX - coords.left;
    var shiftY = event.pageY - coords.top;
    bl_id = block.id.slice(5);

    block.style.position = 'absolute';
    document.body.appendChild(block);
    dragBlock(event);

    block.style.zIndex = 1000; // над другими элементами

  
    // Dragging
    document.onmousemove = function(event) {
      dragBlock(event);
      moveLines(event);
    };
    // Stop drag
    block.onmouseup = function() {
      document.onmousemove = null;
      block.onmouseup = null;
    };

    block.ondragstart = function() {
      return false;
    };
  // Вспомогательная функция для перемещения блока
  function dragBlock(event) {
      block.style.left = event.pageX - shiftX + 'px';
      block.style.top = event.pageY - shiftY + 'px';
    };
  // Drag lines with block
  function moveLines(event){
    if (nodes[bl_id]['to']){
      nodes[bl_id]['to'].forEach((element, index) => {
        line_ = document.getElementById(element);
        if (element < 0) y1 = event.pageY - shiftY + coords.height / 3
        else {
          current_key = document.getElementById('key' + element);
          k_cords = getCoords(current_key);
          y1 = k_cords.top + k_cords.height / 2;
        }
        x1 = event.pageX - shiftX + coords.width;
        line_.setAttribute('x1', `${x1}px`);
        line_.setAttribute('y1', `${y1}px`);
      })
    }
    if (nodes[bl_id]['from']){
      nodes[bl_id]['from'].forEach(element => {
        line_ = document.getElementById(element);
        x2 = event.pageX - shiftX;
        y2 = event.pageY - shiftY + coords.height / 3;
        line_.setAttribute('x2', `${x2}px`);
        line_.setAttribute('y2', `${y2}px`);
      });
    }
  };
}
  
// Create link between blocks
function createLink(event) {
  if (event.target.classList.contains('link_btn')){
    key = event.target.parentNode;
    if (key.classList.contains('message')) {
      var coords = getCoords(key);
      link_id = -cnt_link;
      cnt_link++;
    } else {
      link_id = key.id.slice(3);
      var coords = getCoords(key.parentNode);
    }
  }
  if (! (link_mode || links[link_id])){
    link_mode = true;
    link_line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    link_line.classList.add('link-line');
    link_line.id = link_id;

    if (link_id < 0) y1 = coords.top + coords.height / 2
    else {
      k_cords = getCoords(key);
      y1 = k_cords.top + k_cords.height / 2;
    }
    x1 = coords.left + coords.width;

    link_line.setAttribute('x1', `${x1}px`);
    link_line.setAttribute('y1', `${y1}px`);
    link_line.style.zIndex = 1000;
    link_line.setAttribute("stroke", "black");

    link.appendChild(link_line);
    document.body.before(link);
    document.onmousemove = function(event) {
        editLink(event, link_line, x1, y1);
    };
    document.onmouseup = function(event) {
      stopEdit(event)
    }
  }
}

  // Вспомогательная функция для изменения координат связи
  function editLink(event, line, initialX, initialY) {
    const deltaX = event.clientX;
    const deltaY = event.clientY;
  
    line.setAttribute('x2', `${deltaX}px`);
    line.setAttribute('y2', `${deltaY}px`);
    line.setAttribute('marker-end', "url(#arrowhead)")
  }
  function stopEdit(event) {
    
    if (event.target.classList.contains('message') && link_mode){
      to_id = event.target.parentNode.id.slice(5);

      end_coords = getCoords(event.target);
      if (key.classList.contains('message')) {
        from_id = key.parentNode.id.slice(5)
        if (from_id > 0) key.parentNode.getElementsByClassName('add_btn')[0].style.display = "none";
      } else from_id = key.parentNode.parentNode.id.slice(5);
      

      links[link_id] = [from_id, to_id];
      nodes[from_id]['to'].push(link_id);
      nodes[to_id]['from'].push(link_id);
      x2 = end_coords.left;
      y2 = end_coords.top + end_coords.height / 2;
      link_line.setAttribute('x2', `${x2}px`);
      link_line.setAttribute('y2', `${y2}px`);
      to_unlink_btn(key.getElementsByClassName('link_btn')[0]);
    } else if (! event.target.classList.contains('message') && link_mode) {
      link_line.remove();
    }
    link_mode = false;
    document.onmousedown = null;
    document.onmousemove = null;
    document.onmouseup = null;
  }
  
// Удаление блока или связи
function removeElement(element) {
  console.log(element);
  if (element.classList.contains('key')){
    keys = element.parentNode;
    key_id = element.id.slice(3);
    line_link = document.getElementById(key_id);
    if (line_link){
      bloks = links[key_id];
      line_link.remove()
      nodes[bloks[0]]['to'] = delArrElem(key_id, nodes[bloks[0]]['to']);
      nodes[bloks[1]]['from'] = delArrElem(key_id, nodes[bloks[1]]['from']);
      delete links[key_id];
    
      if (nodes[bloks[0]]['to']) {
        nodes[bloks[0]]['to'].forEach(elem => {
          line_ = document.getElementById(elem);
          current_key = document.getElementById('key' + elem);
          key_coords = getCoords(current_key);
          y1 = key_coords.top + key_coords.height / 2;
          line_.setAttribute('y1', `${y1}px`);
        });
      }
    };

    selectedElement.remove();
    if (keys.getElementsByClassName('key').length == 0) keys.parentNode.getElementsByClassName('message')[0].getElementsByClassName('link_btn')[0].style.display = "flex";
  } else if (element.classList.contains('block')){
      block_id = element.id.slice(5);
      connects = nodes[block_id];
    
      if (connects['to']){
        connects['to'].forEach(elem => {
          nodes[links[elem][1]]['from'] = delArrElem(elem, nodes[links[elem][1]]['from'])
          line_link = document.getElementById(elem);
          line_link.remove();
          delete links[elem];
        })
      }
      if (connects['from']){
        connects['from'].forEach(elem => {
          if (elem < 0) to_link_btn(document.getElementById('block' + links[elem][0]).getElementsByClassName('message')[0].getElementsByClassName('link_btn')[0])
          else to_link_btn(document.getElementById('key' + elem).getElementsByClassName('link_btn')[0]);
          nodes[links[elem][0]]['to'] = delArrElem(elem, nodes[links[elem][0]]['to']);
          line_link = document.getElementById(elem);
          line_link.remove();
          delete links[elem];
        });
      }
      delete nodes[block_id];
      element.remove();
    } else if (element.classList.contains('link-line')) {
      bloks = links[element.id];
      if (element.id < 0) to_link_btn(document.getElementById('block' + bloks[0]).getElementsByClassName('message')[0].getElementsByClassName('link_btn')[0])
      else to_link_btn(document.getElementById('key' + element.id).getElementsByClassName('link_btn')[0]);
      nodes[bloks[0]]['to'] = delArrElem(element.id, nodes[bloks[0]]['to']);
      nodes[bloks[1]]['from'] = delArrElem(element.id, nodes[bloks[1]]['from']);
      delete links[element.id];
      element.remove()
    } 

    unhighlight();
  }

  function saveBtn(){
    data = {blocks:{}, links: {}};
    var textareaList = document.getElementsByTagName("textarea");
    for (element of textareaList) {
      bl_id = element.id.slice(4);
      bl_text = element.value;
      coords = getCoords(element.parentNode);
      func = element.parentNode.parentNode.getElementsByClassName('func_inp')[0].value;
      data['blocks'][bl_id] = {text: bl_text, coords: coords, links: nodes[bl_id], func: func};
    };
    if (links){
      for (const index in links) {
        if (index < 0) data['links'][index] = {text: "", start: links[index][0], end: links[index][1]}
        else {
          key = document.getElementById('key' + index);
          text = key.getElementsByTagName('input')[0].value;
          data['links'][index] = {text: text, start: links[index][0], end: links[index][1]};
        }
      }
    }
    start = document.getElementById('block-1');
    data['blocks'][-1] = {text: '$START$', coords: getCoords(start), links: nodes[-1], func: 'start'};

    start = document.getElementById('block-2');
    data['blocks'][-2] = {text: '$END$', coords: getCoords(start), links: nodes[-2], func: 'end'};

    scenario_id = document.getElementById('scenario');
    data['scenario'] = scenario_id.textContent;

    var graphData = JSON.stringify(data);
    console.log(graphData);

    var xhr = new XMLHttpRequest();
    var url = scenario_id.textContent;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(graphData);
  }

// Обработчик события нажатия правой кнопки мыши
function highlight(event) {
  unhighlight();
  elem = event.target;
  if (elem.classList.contains('message')) {
    elem = elem.parentNode;
  }
  if ((elem.classList.contains('block') || elem.classList.contains('key') || elem.classList.contains('link_line')) && ! selectedElement){
    // if (elem.classList.contains('key')) elem.getElementsByTagName('button')[0].style.display = "inline";
    // else if (elem.id != 'end') {elem.getElementsByClassName('message')[0].getElementsByTagName('button')[0].style.display = "inline"}
    selectedElement = elem;
    selectedElement.style.outline = "2px solid green";
  }
}

function unhighlight () {
  if (selectedElement){
    // if (selectedElement.classList.contains('key')) selectedElement.getElementsByTagName('button')[0].style.display = "none";
    // else if (selectedElement.classList.contains('block') && selectedElement.id != "end") selectedElement.getElementsByClassName('message')[0].getElementsByTagName('button')[0].style.display = "none"
    selectedElement.style.outline = "none";
    selectedElement = null;
  }
}

function delArrElem(elem, arr) {
  return arr.filter(value => value != elem)
}

function getCoords(elem) {   // кроме IE8-
  var box = elem.getBoundingClientRect();
  return {
    top: box.top,
    left: box.left,
    width: box.width,
    height: box.height
  };
}
