const sectionItems = document.querySelector('.cart__items');
const pPrice = document.querySelector('.total-price');

const updateStorage = () => {
  const numberCart = document.querySelector('.number-cart');
  localStorage.setItem('cart', sectionItems.innerHTML);
  localStorage.setItem('priceCart', pPrice.innerHTML);
  localStorage.setItem('itemsCart', numberCart.outerHTML);
};

const updateNumItems = (items) => {
  const notification = document.querySelector('.number-cart')
  if(items.length > 0) {
    notification.classList.add('opacity-cart');
    notification.innerText = items.length;
  } else {
    notification.classList.remove('opacity-cart');
  }
}

const sumPrices = (acc, element) => {
  const arr = element.innerText.split('$');
  const price = Number(arr[1]);
  const total = acc + price;
  return total;
};

const updatePrice = async () => {
  const items = document.querySelectorAll('.item__p__cart');
  updateNumItems(items);
  const total = [...items].reduce(sumPrices, 0);
  const text = total === 0 ? 'Carrinho vazio.' : `R$ ${total.toFixed(2)}`
  pPrice.innerText = text;
};

const enableLoading = () => {
  document.querySelector('.loading').classList.add('enable-loading');
}

const disableLoading = () => {
  document.querySelector('.loading').classList.remove('enable-loading')
}

const checkError = (product) => {
  const check = document.querySelector('.items').children.length;
  if(!check) {
    const p = document.createElement('p');
    p.classList.add('p-error')
    p.innerText = `Opa! 
    Algo deu errado na sua busca por: 
    
    ${product}`
    document.body.appendChild(p);
  }
}

function createProductImageElement(imageSource, cart) {
  const img = document.createElement('img');
  img.className = cart ? 'item__image__cart' : 'item__image';
  img.src = `https://http2.mlstatic.com/D_NQ_NP_${imageSource}-O.webp`;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ id, title, thumbnail_id, price }) {
  const section = document.createElement('section');
  section.className = 'item';
  const btn = createCustomElement('button', 'item__add', '');
  btn.appendChild(createCustomElement('i', 'fas fa-shopping-cart', ''));

  section.appendChild(createProductImageElement(thumbnail_id, false));
  section.appendChild(createCustomElement('span', 'item__sku', id));
  section.appendChild(createCustomElement('p', 'item__title', title));
  section.appendChild(createCustomElement('p', 'item__price', `R$ ${price.toFixed(2)}`));
  section.appendChild(btn);

  return section;
}

function getIdFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function cartItemClickListener({ target }) {
  target.parentNode.remove();
  updatePrice();
  updateStorage();
}

const loadStorage = () => {
  const numberCart = document.querySelector('.number-cart');
  pPrice.innerHTML = localStorage.getItem('priceCart');
  sectionItems.innerHTML = localStorage.getItem('cart');
  numberCart.outerHTML = localStorage.getItem('itemsCart');
  document
    .querySelectorAll('.cart__item')
    .forEach((e) => e.addEventListener('click', cartItemClickListener));
};

function createCartItemElement({ title, price, thumbnail_id }) {
  const innerText = `${title}
  
  R$${price.toFixed(2)}
  `;
  const div = document.createElement('div');
  const divCart = document.createElement('div');
  divCart.classList.add('div-cart')
  const removeBtn = createCustomElement('i', 'fas fa-trash', '')
  div.className = 'cart__item';
  removeBtn.addEventListener('click', cartItemClickListener);
  divCart.appendChild(createProductImageElement(thumbnail_id, true));
  divCart.appendChild(createCustomElement('p', 'item__p__cart', innerText));
  div.appendChild(divCart);
  div.appendChild(removeBtn);
  sectionItems.appendChild(div);
}

const fetchPC = async (product) => {
  const response = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${product}`);
  const data = await response.json();
  return data;
};

const fetchCart = async (id) => {
  const response = await fetch(`https://api.mercadolibre.com/items/${id}`);
  const data = await response.json();
  return data;
};

const getPcs = ({ results }) => {
  if(!!document.querySelector('.p-error')) {
    document.querySelector('.p-error').remove();
  }
  
  results.forEach((result) => {
    document
      .querySelector('.items')
      .appendChild(createProductItemElement(result));
  });
};

const clickToCart = async () => {
  document.querySelectorAll('.item__add').forEach((e) =>
    e.addEventListener('click', async () => {
      try {
        const data = await fetchCart(getIdFromProductItem(e.parentNode));
        createCartItemElement(data);
        updatePrice();
        updateStorage();
      } catch (error) {
        console.log(error);
      }
    }));
};

const clickToRemove = () => {
  document.querySelector('.empty-cart').addEventListener('click', () => {
    sectionItems.innerHTML = '';
    updatePrice();
    updateStorage();
  });
};

const getData = async (product) => {
  try {
    getPcs(await fetchPC(product))
    disableLoading();
    await clickToCart();
    clickToRemove();
    checkError(product);
  } catch (error) {
    console.log(error);
  }
};

const getSide = (side) => {
  const eventCart = document.querySelector('.fa-shopping-bag');
  const elementCart = document.querySelector('.cart');
  const eventSearch = document.querySelector('.fa-search');
  const elementSearch = document.querySelector('.search');
  
  const leftSide = {
    event: eventSearch,
    element: elementSearch,
    class: 'translate-search'
  }
  const rightSide = {
    event: eventCart,
    element: elementCart,
    class: 'translate-car'
  }

  return side === 'left' ? leftSide : side === 'right' ? rightSide : 'Error';
}

const translateElement = (sideRemove, sideGet) => {
  const { element: elementMoveRM, class: classRM } = getSide(sideRemove);
  const { 
      event: elementClick, 
      element: elementMove, 
      class: class1 } = getSide(sideGet);

  elementClick.addEventListener('click', () => {
    if(elementMoveRM.classList.contains(classRM)) {
      elementMoveRM.classList.remove(classRM);
    }
    
    if(elementMove.classList.contains(class1)) elementMove.classList.remove(class1);
    else elementMove.classList.add(class1);
  })
}

const generateSearch = (input) => {
  const product = input.value;
  document.querySelector('.items').innerHTML = '';
  enableLoading();
  getData(product);
  input.value = '';
}

const clickToSearch = (element, event, input) => {
  element.addEventListener(event, (e) => {
    if(event === 'keypress') {
      if(e.key === 'Enter') {
        document.querySelector('.search').classList.remove('translate-search');
        generateSearch(input);
      }
    } else generateSearch(input);
  })
}

clickToSearch(document.querySelector('#search-item-click'), 'click', document.querySelector('#search-items'));
clickToSearch(document.querySelector('#search'), 'keypress', document.querySelector('#search'));
clickToSearch(document.querySelector('.search-header'), 'keypress', document.querySelector('.search-header'));
loadStorage();
translateElement('right', 'left');
translateElement('left', 'right');