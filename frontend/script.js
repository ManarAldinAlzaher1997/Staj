document.addEventListener('DOMContentLoaded', function() {

  if (document.querySelector('.slider')) {
    initSlider();
  }
  

  animateElementsSequentially();
  

  if (document.getElementById('loginModal')) {
    initLoginModal();
  }
  

  initSepet();
  
 
  if (document.getElementById('menuItems')) {
    initMenuPage();
  }
  

  if (document.getElementById('siparislerimLink')) {
    initSiparisGecmisi();
  }
  

  if (document.getElementById('addCategory')) {
    initAdminPanel();
  }
  

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {

      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('sepet');
      

      updateUIForLoggedOutUser();
      updateSepetUI();
      

      window.location.reload();
    });
  }
  

  checkUserStatus();
  

  updateSepetUI();
  

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const userParam = urlParams.get('user');
  const error = urlParams.get('error');

  if (error) {
    const errorMessages = {
      'Google ile giriş sırasında bir hata oluştu': 'Google girişi sırasında teknik bir sorun oluştu',
      'Kullanıcı bilgileri alınamadı': 'Kullanıcı bilgileri alınamadı, lütfen tekrar deneyin',
      'Google girişi başarısız': 'Google girişi başarısız oldu'
    };
    
    const friendlyError = errorMessages[error] || error;
    alert(friendlyError);
    
   
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }

  if (token && userParam) {
    try {
      
      const user = JSON.parse(decodeURIComponent(userParam));
      
 
      if (!user || !user.id) {
        throw new Error('Geçersiz kullanıcı bilgileri');
      }
      
   
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
     
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
     
      alert(`Hoş geldiniz ${user.name}! Google ile giriş başarılı.`);
      
  
      if (user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'login.html';
      }
      
    } catch (error) {
      console.error('Google giriş hatası:', error);
      if (error.message.includes('JSON')) {
        alert('Kullanıcı bilgileri işlenirken hata oluştu. Lütfen tekrar deneyin.');
      } else {
        alert('Google ile giriş sırasında bir hata oluştu: ' + error.message);
      }
    }
  }
});

/*SLIDER FONKSİYONLARI */
function initSlider() {
  const slider = document.querySelector('.slider');
  if (!slider) return;

  const sliderContainer = document.querySelector('.slider-container');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const dots = document.querySelectorAll('.dot');

  let slides = document.querySelectorAll('.slide');
  let currentIndex = 1;
  let slideInterval;
  const slideDuration = 5000;

  function cloneSlides() {
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);

    slider.appendChild(firstClone);
    slider.insertBefore(lastClone, slides[0]);

    slides = document.querySelectorAll('.slide');
  }

  function goToSlide(index, animate = true) {
    slider.style.transition = animate ? 'transform 0.5s ease-in-out' : 'none';
    slider.style.transform = `translateX(-${index * 100}%)`;
    currentIndex = index;
    updateDots();
  }

  function updateDots() {
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex - 1);
    });
  }

  function nextSlide() {
    if (currentIndex >= slides.length - 1) return;
    goToSlide(currentIndex + 1);
    if (currentIndex === slides.length - 1) {
      setTimeout(() => goToSlide(1, false), 500);
    }
  }

  function prevSlide() {
    if (currentIndex <= 0) return;
    goToSlide(currentIndex - 1);
    if (currentIndex === 0) {
      setTimeout(() => goToSlide(slides.length - 2, false), 500);
    }
  }

  function startAutoplay() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, slideDuration);
  }


  slider.addEventListener('transitionend', () => {
    if (currentIndex === 0) goToSlide(slides.length - 2, false);
    else if (currentIndex === slides.length - 1) goToSlide(1, false);
  });

  if (prevBtn) prevBtn.addEventListener('click', () => {
    clearInterval(slideInterval);
    prevSlide();
    startAutoplay();
  });

  if (nextBtn) nextBtn.addEventListener('click', () => {
    clearInterval(slideInterval);
    nextSlide();
    startAutoplay();
  });

  if (dots.length > 0) {
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(slideInterval);
        goToSlide(i + 1);
        startAutoplay();
      });
    });
  }

  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
    sliderContainer.addEventListener('mouseleave', startAutoplay);
  }


  cloneSlides();
  goToSlide(1, false);
  startAutoplay();
}

/* ANİMASYON FONKSİYONLARI */
function animateElementsSequentially() {
  document.querySelectorAll('.fade-in-element').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 200 + (i * 400));
  });
}

/* GİRİŞ MODAL FONKSİYONLARI */
function initLoginModal() {
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');
  const showRegisterBtn = document.getElementById('showRegister');
  const showLoginBtn = document.getElementById('showLogin');
  const closeLoginBtn = document.querySelector('.close-login');
  const closeRegisterBtn = document.querySelector('.close-register');
  const loginForm = document.getElementById('emailLoginForm');
  const registerForm = document.getElementById('registerForm');
  const loginLink = document.getElementById('loginLink');
  
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', function() {
      window.location.href = '/auth/google';
    });
  }
  

  if (loginLink) {
    loginLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (isUserLoggedIn()) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = 'index.html';
      } else {
        if (loginModal) loginModal.style.display = 'block';
      }
    });
  }
  

  if (closeLoginBtn) {
    closeLoginBtn.addEventListener('click', () => {
      if (loginModal) loginModal.style.display = 'none';
    });
  }
  
  if (closeRegisterBtn) {
    closeRegisterBtn.addEventListener('click', () => {
      if (registerModal) registerModal.style.display = 'none';
    });
  }
  
 
  if (showRegisterBtn) {
    showRegisterBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (loginModal) loginModal.style.display = 'none';
      if (registerModal) registerModal.style.display = 'block';
    });
  }
  

  if (showLoginBtn) {
    showLoginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (registerModal) registerModal.style.display = 'none';
      if (loginModal) loginModal.style.display = 'block';
    });
  }
  

  window.addEventListener('click', function(e) {
    if (e.target === loginModal) loginModal.style.display = 'none';
    if (e.target === registerModal) registerModal.style.display = 'none';
  });
  
 
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const result = await loginUser(email, password);
        
        if (result.success) {
          if (loginModal) loginModal.style.display = 'none';
          
          if (result.user.role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'index.html';
          }
        }
      } catch (error) {
        console.error('Giriş hatası:', error);
        alert(error.message || 'Giriş sırasında bir hata oluştu');
      }
    });
  }


  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const name = document.getElementById('regName').value;
      const email = document.getElementById('regEmail').value;
      const phone = document.getElementById('regPhone')?.value || '';
      const password = document.getElementById('regPassword').value;
      const passwordConfirm = document.getElementById('regPasswordConfirm').value;
      
      if (password !== passwordConfirm) {
        alert('Şifreler eşleşmiyor');
        return;
      }
      
      try {
        const result = await registerUser({ name, email, phone, password, passwordConfirm });
        
        if (result.success) {
          if (registerModal) registerModal.style.display = 'none';
          
          if (result.user.role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'index.html';
          }
        }
      } catch (error) {
        console.error('Kayıt hatası:', error);
        alert(error.message || 'Kayıt sırasında bir hata oluştu');
      }
    });
  }
}

/* SEPET FONKSİYONLARI */
function initSepet() {
  const sepetLink = document.querySelector('a[href="/sepet"]');
  const sepetModal = document.getElementById('sepetModal');
  
  let sepet = JSON.parse(localStorage.getItem('sepet')) || [];

  window.addToCart = function(productId, name, price) {
    const safePrice = Number(price) || 0;
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value) || 1;
    
    const existingItem = sepet.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      sepet.push({ productId, name, price: safePrice, quantity });
    }
    updateSepet();
    alert(`${quantity} adet ${name} sepete eklendi!`);
  };

  function updateSepet() {
    localStorage.setItem('sepet', JSON.stringify(sepet));
    updateSepetUI();
  }

  if (sepetLink) {
    sepetLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (sepetModal) {
        sepetModal.style.display = 'block';
        updateSepetUI();
      }
    });
  }

  if (sepetModal) {
    const closeSepet = document.querySelector('.close-sepet');
    if (closeSepet) {
      closeSepet.addEventListener('click', () => sepetModal.style.display = 'none');
    }

    window.addEventListener('click', (e) => {
      if (e.target === sepetModal) sepetModal.style.display = 'none';
    });

    // Event delegation for quantity and remove buttons
    const sepetBody = document.getElementById('sepetBody');
    if (sepetBody) {
      sepetBody.addEventListener('click', function(e) {
        const target = e.target;

        if (target.classList.contains('quantity-btn')) {
          const index = parseInt(target.dataset.index);
          const action = target.dataset.action;
          let sepet = JSON.parse(localStorage.getItem('sepet')) || [];

          if (action === 'increase') {
            sepet[index].quantity = (sepet[index].quantity || 1) + 1;
          } else if ((sepet[index].quantity || 1) > 1) {
            sepet[index].quantity = (sepet[index].quantity || 1) - 1;
          } else {
            sepet.splice(index, 1);
          }

          localStorage.setItem('sepet', JSON.stringify(sepet));
          updateSepetUI();
        } else if (target.classList.contains('remove-btn')) {
          let sepet = JSON.parse(localStorage.getItem('sepet')) || [];
          sepet.splice(parseInt(target.dataset.index), 1);
          localStorage.setItem('sepet', JSON.stringify(sepet));
          updateSepetUI();
        }
      });
    }

    const siparisVerBtn = document.querySelector('.siparis-ver-btn');
    if (siparisVerBtn) {
      siparisVerBtn.addEventListener('click', async () => {
        if (sepet.length === 0) return alert('Sepetiniz boş!');
        
        let userInfo = '';
        
        if (isUserLoggedIn()) {
          const user = JSON.parse(localStorage.getItem('user'));
          userInfo = `Müşteri: ${user.name}\nE-posta: ${user.email}\n\n`;
        } else {
          userInfo = `Misafir Müşteri\n\n`;
        }
        
        let message = `Merhaba, sipariş vermek istiyorum.\n\n`;
        message += userInfo;
        message += `Sipariş Detayları:\n`;
        
        let total = 0;
        sepet.forEach((item, index) => {
          const itemTotal = (item.price || 0) * (item.quantity || 1);
          total += itemTotal;
          message += `${index + 1}. ${item.name} - ${item.quantity} adet - ${itemTotal.toFixed(2)} TL\n`;
        });
        
        message += `\nToplam Tutar: ${total.toFixed(2)} TL`;
        
        const phoneNumber = '905522996536';
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        window.open(whatsappURL, '_blank');
        
        if (isUserLoggedIn()) {
          try {
            const orderItems = sepet.map(item => ({
              product: item.productId,
              quantity: item.quantity
            }));
            
            const response = await fetch('/api/orders', {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({ 
                items: orderItems,
                status: 'pending',
                total: total
              })
            });
            
            const data = await response.json();
            
            if (data.success) {
              sepet = [];
              updateSepet();
              sepetModal.style.display = 'none';
              alert('Siparişiniz WhatsApp üzerinden iletilmiştir. Teşekkür ederiz!');
            }
          } catch (error) {
            console.error('Sipariş kaydetme hatası:', error);
          }
        } else {
          sepet = [];
          updateSepet();
          sepetModal.style.display = 'none';
          alert('Siparişiniz WhatsApp üzerinden iletilmiştir. Teşekkür ederiz!');
        }
      });
    }

    const siparisIptalBtn = document.querySelector('.siparis-iptal-btn');
    if (siparisIptalBtn) {
      siparisIptalBtn.addEventListener('click', function() {
        if (sepet.length === 0) {
          alert('Sepetiniz zaten boş!');
          return;
        }
        
        const onay = confirm('Sepeti temizlemek istediğinize emin misiniz?');
        if (!onay) return;

        sepet = [];
        localStorage.setItem('sepet', JSON.stringify(sepet));
        updateSepetUI();
        
        alert('Sepet temizlendi!');
      });
    }
  }
}

function updateSepetUI() {
  const sepetBody = document.getElementById('sepetBody');
  const totalPriceElement = document.getElementById('totalPrice');
  const sepet = JSON.parse(localStorage.getItem('sepet')) || [];
  
  if (!sepetBody || !totalPriceElement) return;

  if (sepet.length === 0) {
    sepetBody.innerHTML = `
      <div class="empty-cart">
        <p>Sepetiniz boş</p>
      </div>`;
    totalPriceElement.textContent = '0.00';
    return;
  }

  let html = '';
  let total = 0;

  sepet.forEach((item, index) => {
    const itemPrice = Number(item.price) || 0;
    const itemQuantity = item.quantity || 1;
    const itemTotal = itemPrice * itemQuantity;
    total += itemTotal;
    
    html += `
      <div class="sepet-item">
        <div class="item-info">
          <div class="item-name">${item.name}</div>
          <div class="item-price">${itemPrice.toFixed(2)} TL</div>
        </div>
        <div class="item-quantity">
          <button class="quantity-btn decrease-btn" data-index="${index}">-</button>
          <span class="quantity-display">${itemQuantity}</span>
          <button class="quantity-btn increase-btn" data-index="${index}">+</button>
          <button class="remove-btn" data-index="${index}">Sil</button>
        </div>
      </div>`;
  });

  sepetBody.innerHTML = html;
  totalPriceElement.textContent = total.toFixed(2);

  document.querySelectorAll('.quantity-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.dataset.index);
      const action = this.dataset.action;
      let sepet = JSON.parse(localStorage.getItem('sepet')) || [];
      
      if (action === 'increase') {
        sepet[index].quantity = (sepet[index].quantity || 1) + 1;
      } else if ((sepet[index].quantity || 1) > 1) {
        sepet[index].quantity = (sepet[index].quantity || 1) - 1;
      } else {
        sepet.splice(index, 1);
      }
      
      localStorage.setItem('sepet', JSON.stringify(sepet));
      updateSepetUI();
    });
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      let sepet = JSON.parse(localStorage.getItem('sepet')) || [];
      sepet.splice(parseInt(this.dataset.index), 1);
      localStorage.setItem('sepet', JSON.stringify(sepet));
      updateSepetUI();
    });
  });
}

/* MENÜ SAYFASI FONKSİYONLARI */
function initMenuPage() {
  if (document.getElementById('menuItems')) {
    loadCategoriesAndProducts();
  }
  
  const categoryButtons = document.querySelectorAll('.category-btn');
  const menuItems = document.querySelectorAll('.menu-item');
  
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      const categoryId = button.getAttribute('data-category');
      
      menuItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        
        if (categoryId === 'all' || itemCategory === categoryId) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
  
  const searchInput = document.querySelector('.search-container input');
  const searchButton = document.querySelector('.search-container button');
  
  if (searchInput && searchButton) {
    const performSearch = () => {
      const searchTerm = searchInput.value.toLowerCase();
      
      menuItems.forEach(item => {
        const itemName = item.querySelector('h3').textContent.toLowerCase();
        const itemDescription = item.querySelector('p').textContent.toLowerCase();
        
        if (itemName.includes(searchTerm) || itemDescription.includes(searchTerm)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    };
    
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
}

/* SIPARIŞ GEÇMİŞİ FONKSİYONLARI */
function initSiparisGecmisi() {
  if (!window.location.pathname.includes('login.html')) {
    const siparislerimLink = document.getElementById('siparislerimLink');
    if (siparislerimLink) {
      siparislerimLink.style.display = 'none';
    }
    return;
  }
  
  const siparislerimLink = document.getElementById('siparislerimLink');
  const siparislerimModal = document.getElementById('siparislerimModal');
  if (!siparislerimLink || !siparislerimModal) return;

  const closeSiparislerim = document.querySelector('.close-siparislerim');
  const siparislerimBody = document.getElementById('siparislerimBody');
  
  siparislerimLink.addEventListener('click', async (e) => {
    e.preventDefault();
    
    if (!isUserLoggedIn()) {
      alert('Sipariş geçmişinizi görüntülemek için giriş yapmalısınız');
      const loginModal = document.getElementById('loginModal');
      if (loginModal) loginModal.style.display = 'block';
      return;
    }
    
    siparislerimModal.style.display = 'block';
    
    try {
      const orders = await getUserOrders();
      updateSiparisGecmisiUI(orders);
    } catch (error) {
      console.error('Sipariş geçmişi yüklenirken hata:', error);
      siparislerimBody.innerHTML = `
        <div class="empty-orders">
          <p>Sipariş geçmişi yüklenirken bir hata oluştu.</p>
        </div>`;
    }
  });

  if (closeSiparislerim) {
    closeSiparislerim.addEventListener('click', () => siparislerimModal.style.display = 'none');
  }
  
  window.addEventListener('click', (e) => e.target === siparislerimModal && (siparislerimModal.style.display = 'none'));

  function updateSiparisGecmisiUI(orders) {
    if (!orders || orders.length === 0) {
      siparislerimBody.innerHTML = `
        <div class="empty-orders">
          <p>Henüz sipariş geçmişiniz bulunmamaktadır.</p>
        </div>`;
      return;
    }

    siparislerimBody.innerHTML = orders.map((siparis, index) => {
      const toplamTutar = siparis.total ? siparis.total.toFixed(2) : '0.00';
      
      let durumText = '';
      let durumClass = '';
      
      switch(siparis.status) {
        case 'pending':
          durumText = 'BEKLEMEDE';
          durumClass = 'durum-beklemede';
          break;
        case 'confirmed':
          durumText = 'ONAYLANDI';
          durumClass = 'durum-onaylandi';
          break;
        case 'preparing':
          durumText = 'HAZIRLANIYOR';
          durumClass = 'durum-hazirlaniyor';
          break;
        case 'ready':
          durumText = 'HAZIR';
          durumClass = 'durum-hazir';
          break;
        case 'completed':
          durumText = 'TAMAMLANDI';
          durumClass = 'durum-tamamlandi';
          break;
        case 'cancelled':
          durumText = 'İPTAL EDİLDI';
          durumClass = 'durum-iptal';
          break;
        default:
          durumText = siparis.status.toUpperCase();
          durumClass = 'durum-beklemede';
      }
      
      return `
      <div class="siparis-item">
        <div class="siparis-header">
          <span class="siparis-id">${siparis.orderNumber}</span>
          <span class="siparis-tarih">${new Date(siparis.createdAt).toLocaleDateString('tr-TR')}</span>
          <span class="siparis-durum ${durumClass}">
            ${durumText}
          </span>
        </div>
        <div class="siparis-urunler">
          ${siparis.items.map(urun => {
            const urunFiyati = urun.price ? urun.price.toFixed(2) : '0.00';
            return `
            <div class="urun-item">
              <span>${urun.product?.name || 'Ürün'} <span class="urun-adet">x${urun.quantity || 1}</span></span>
              <span class="urun-fiyat">${urunFiyati} TL</span>
            </div>`;
          }).join('')}
        </div>
        <div class="siparis-toplam">Toplam: ${toplamTutar} TL</div>
        <div class="siparis-actions">
          <button class="tekrar-siparis-btn" data-order='${JSON.stringify(siparis.items)}'>Tekrar Sipariş Ver</button>
        </div>
      </div>`;
    }).join('');
    
    document.querySelectorAll('.tekrar-siparis-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const orderItems = JSON.parse(this.dataset.order);
        
        orderItems.forEach(item => {
          for (let i = 0; i < (item.quantity || 1); i++) {
            if (typeof window.addToCart === 'function') {
              window.addToCart(
                item.product?._id || Date.now().toString(),
                item.product?.name || 'Ürün', 
                item.price
              );
            }
          }
        });
        
        alert('Sipariş sepete eklendi!');
        siparislerimModal.style.display = 'none';
        const sepetModal = document.getElementById('sepetModal');
        if (sepetModal) sepetModal.style.display = 'block';
      });
    });
  }
}

/* ADMIN PANELİ FONKSİYONLARI */
function initAdminPanel() {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  
  if (!user || !token || user.role !== 'admin') {
    alert('Admin paneline erişim izniniz yok');
    window.location.href = 'index.html';
    return;
  }

  const addCategoryBtn = document.getElementById('addCategory');
  const newCategoryInput = document.getElementById('newCategory');
  const categoryList = document.getElementById('categoryList');
  
  if (addCategoryBtn && newCategoryInput && categoryList) {
    addCategoryBtn.addEventListener('click', async function() {
      const categoryName = newCategoryInput.value.trim();
      
      if (!categoryName) {
        alert('Lütfen bir kategori adı girin.');
        return;
      }
      
      try {
        const response = await fetch('/admin/kategoriler', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ name: categoryName })
        });
        
        if (response.status === 401) {
          alert('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          window.location.reload();
          return;
        }
        
        if (response.status === 403) {
          alert('Bu işlem için admin yetkisi gerekiyor.');
          return;
        }
        
        const data = await response.json();
        
        if (data.success) {
          const li = document.createElement('li');
          li.innerHTML = `
            ${data.category.name}
            <button class="delete-category" onclick="deleteCategory('${data.category._id}', this)">Sil</button>
          `;
          categoryList.appendChild(li);
          
          const categorySelect = document.getElementById('productCategory');
          const option = document.createElement('option');
          option.value = data.category._id;
          option.textContent = data.category.name;
          categorySelect.appendChild(option);
          
          newCategoryInput.value = '';
          alert('Kategori başarıyla eklendi!');
        } else {
          alert('Kategori eklenirken bir hata oluştu: ' + data.error);
        }
      } catch (error) {
        console.error('Kategori ekleme hatası:', error);
        alert('Kategori eklenirken bir hata oluştu. Konsolu kontrol edin.');
      }
    });
  }
  
  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData();
      formData.append('name', document.getElementById('productName').value);
      formData.append('description', document.getElementById('productDesc').value);
      formData.append('price', document.getElementById('productPrice').value);
      formData.append('category', document.getElementById('productCategory').value);
      
      const imageFile = document.getElementById('productImage').files[0];
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      try {
        const response = await fetch('/admin/urunler', {
          method: 'POST',
          headers: {
            'Authorization': getAuthHeaders().Authorization
          },
          body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
          const productList = document.getElementById('productList');
          const productItem = document.createElement('div');
          productItem.classList.add('product-item');
          productItem.innerHTML = `
            <div class="product-item-info">
              <h4>${data.product.name}</h4>
              <p>${data.product.description}</p>
              <p class="price">${data.product.price} TL</p>
            </div>
            <div class="product-item-actions">
              <button class="edit-btn" onclick="editProduct('${data.product._id}')">Düzenle</button>
              <button class="delete-btn" onclick="deleteProduct('${data.product._id}', this)">Sil</button>
            </div>
          `;
          productList.appendChild(productItem);
          
          productForm.reset();
          document.getElementById('imagePreview').style.display = 'none';
          
          alert('Ürün başarıyla eklendi!');
        } else {
          alert('Ürün eklenirken bir hata oluştu: ' + data.error);
        }
            } catch (error) {
        console.error('Ürün ekleme hatası:', error);
        alert('Ürün eklenirken bir hata oluştu. Konsolu kontrol edin.');
      }
    });
  }
  
  const productImageInput = document.getElementById('productImage');
  const imagePreview = document.getElementById('imagePreview');
  
  if (productImageInput && imagePreview) {
    productImageInput.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          imagePreview.src = e.target.result;
          imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        imagePreview.style.display = 'none';
      }
    });
  }
  
  loadAdminData();
}

window.deleteCategory = async function(categoryId, buttonElement) {
  if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?\\n\\nBu işlem geri alınamaz!')) {
    return;
  }
  
  try {
    const response = await fetch(`/admin/kategoriler/${categoryId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Kategori silinirken bir hata oluştu');
    }
    
    if (data.success) {
      const listItem = buttonElement.parentElement;
      listItem.remove();
      
      const categorySelect = document.getElementById('productCategory');
      const optionToRemove = Array.from(categorySelect.options).find(option => option.value === categoryId);
      if (optionToRemove) {
        categorySelect.removeChild(optionToRemove);
      }
      
      alert('Kategori başarıyla silindi!');
    } else {
      alert('Kategori silinirken hata: ' + (data.error || 'Bilinmeyen hata'));
    }
  } catch (error) {
    console.error('Kategori silme hatası:', error);
    alert('Kategori silinirken hata: ' + error.message);
  }
};

window.deleteProduct = async function(productId, buttonElement) {
  if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
    return;
  }
  
  try {
    const response = await fetch(`/admin/urunler/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (response.ok) {
      const productItem = buttonElement.closest('.product-item');
      productItem.remove();
      alert('Ürün başarıyla silindi!');
    } else {
      const data = await response.json();
      alert('Ürün silinirken hata: ' + (data.error || 'Bilinmeyen hata'));
    }
  } catch (error) {
    console.error('Ürün silme hatası:', error);
    alert('Ürün silinirken bir hata oluştu.');
  }
};

window.editProduct = async function(productId) {
  try {
    console.log('Ürün düzenleme başlatıldı:', productId);
    
    const response = await fetch(`/api/products/${productId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ürün bilgileri alınamadı');
    }
    
    const product = await response.json();
    console.log('Ürün bilgileri alındı:', product);
    
    document.getElementById('editProductId').value = product._id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductDesc').value = product.description;
    document.getElementById('editProductPrice').value = product.price;
    
    const categorySelect = document.getElementById('editProductCategory');
    if (categorySelect && product.category) {
      categorySelect.value = product.category._id || product.category;
    }
    
    const editImagePreview = document.getElementById('editImagePreview');
    const currentImageInfo = document.getElementById('currentImageInfo');
    
    if (product.image) {
      editImagePreview.src = '/uploads/' + product.image;
      editImagePreview.style.display = 'block';
      if (currentImageInfo) {
        currentImageInfo.innerHTML = `Mevcut resim: ${product.image}`;
      }
    } else {
      editImagePreview.style.display = 'none';
      if (currentImageInfo) {
        currentImageInfo.innerHTML = 'Mevcut resim yok';
      }
    }
    
    document.getElementById('editFormContainer').classList.remove('hidden');
    document.getElementById('addFormContainer').classList.add('hidden');
    
  } catch (error) {
    console.error('Ürün düzenleme hatası:', error);
    alert('Ürün bilgileri alınırken bir hata oluştu: ' + error.message);
  }
};

if (document.getElementById('editProductForm')) {
  document.getElementById('editProductForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const productId = document.getElementById('editProductId').value;
    const name = document.getElementById('editProductName').value;
    const description = document.getElementById('editProductDesc').value;
    const price = document.getElementById('editProductPrice').value;
    const category = document.getElementById('editProductCategory').value;
    const imageFile = document.getElementById('editProductImage').files[0];
    
    if (!name || !description || !price || !category) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const response = await fetch(`/admin/urunler/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': getAuthHeaders().Authorization
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Ürün başarıyla güncellendi!');
        
        document.getElementById('editProductForm').reset();
        document.getElementById('editFormContainer').classList.add('hidden');
        document.getElementById('addFormContainer').classList.remove('hidden');
        document.getElementById('editImagePreview').style.display = 'none';
        document.getElementById('currentImageInfo').innerHTML = '';
        
        loadAdminData();
      } else {
        alert('Ürün güncellenirken bir hata oluştu: ' + data.error);
      }
    } catch (error) {
      console.error('Ürün güncelleme hatası:', error);
      alert('Ürün güncellenirken bir hata oluştu: ' + error.message);
    }
  });
}

if (document.getElementById('cancelEdit')) {
  document.getElementById('cancelEdit').addEventListener('click', function() {
    document.getElementById('editProductForm').reset();
    document.getElementById('editFormContainer').classList.add('hidden');
    document.getElementById('addFormContainer').classList.remove('hidden');
    document.getElementById('editImagePreview').style.display = 'none';
    document.getElementById('currentImageInfo').innerHTML = '';
  });
}

if (document.getElementById('editProductImage')) {
  document.getElementById('editProductImage').addEventListener('change', function() {
    const file = this.files[0];
    const editImagePreview = document.getElementById('editImagePreview');
    
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        editImagePreview.src = e.target.result;
        editImagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });
}

async function loadAdminData() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!user || !token || user.role !== 'admin') {
      alert('Admin paneline erişim izniniz yok');
      window.location.href = 'index.html';
      return;
    }
    
    const categoriesResponse = await fetch('/api/categories', {
      headers: getAuthHeaders()
    });
    
    if (categoriesResponse.status === 401 || categoriesResponse.status === 403) {
      alert('Admin paneline erişim izniniz yok');
      window.location.href = 'index.html';
      return;
    }
    
    const categories = await categoriesResponse.json();
    
    const categorySelect = document.getElementById('productCategory');
    const editCategorySelect = document.getElementById('editProductCategory');
    
    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">Kategori Seçin</option>';
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category._id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    }
    
    if (editCategorySelect) {
      editCategorySelect.innerHTML = '<option value="">Kategori Seçin</option>';
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category._id;
        option.textContent = category.name;
        editCategorySelect.appendChild(option);
      });
    }
    
    const categoryList = document.getElementById('categoryList');
    if (categoryList) {
      categoryList.innerHTML = '';
      categories.forEach(category => {
        const li = document.createElement('li');
        li.innerHTML = `
          ${category.name}
          <button class="delete-category" onclick="deleteCategory('${category._id}', this)">Sil</button>
        `;
        categoryList.appendChild(li);
      });
    }
    
    const productsResponse = await fetch('/api/products', {
      headers: getAuthHeaders()
    });
    
    if (!productsResponse.ok) {
      throw new Error('Ürünler yüklenirken hata oluştu');
    }
    
    const products = await productsResponse.json();
    
    const productList = document.getElementById('productList');
    if (productList) {
      productList.innerHTML = '';
      
      products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.classList.add('product-item');
        productItem.innerHTML = `
          <div class="product-item-info">
            <h4>${product.name}</h4>
            <p>${product.description}</p>
            <p class="price">${product.price} TL</p>
          </div>
          <div class="product-item-actions">
            <button class="edit-btn" onclick="editProduct('${product._id}')">Düzenle</button>
            <button class="delete-btn" onclick="deleteProduct('${product._id}', this)">Sil</button>
          </div>
        `;
        productList.appendChild(productItem);
      });
    }
  } catch (error) {
    console.error('Veri yükleme hatası:', error);
    alert('Veri yüklenirken bir hata oluştu: ' + error.message);
  }
}

/* YARDIMCI FONKSİYONLAR */

async function loginUser(email, password) {
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    throw error;
  }
}

async function registerUser(userData) {
  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    throw error;
  }
}

async function loadCategoriesAndProducts() {
  try {
    const categoriesResponse = await fetch('/api/categories');
    const categories = await categoriesResponse.json();
    
    const categoriesContainer = document.getElementById('categories');
    if (categoriesContainer) {
      categoriesContainer.innerHTML = `
        <button class="category-btn active" data-category="all">Tümü</button>
        ${categories.map(cat => 
          `<button class="category-btn" data-category="${cat._id}">${cat.name}</button>`
        ).join('')}
      `;
      
      document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const categoryId = this.getAttribute('data-category');
          loadProducts(categoryId);
          
          document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
        });
      });
    }
    
    loadProducts('all');
  } catch (error) {
    console.error('Kategoriler yüklenirken hata:', error);
  }
}

async function loadProducts(categoryId = 'all') {
  try {
    const url = categoryId === 'all' 
      ? '/api/products' 
      : `/api/products?category=${categoryId}`;
    
    const response = await fetch(url);
    const products = await response.json();
    
    displayProducts(products);
  } catch (error) {
    console.error('Ürünler yüklenirken hata:', error);
  }
}

function displayProducts(products) {
  const menuItemsContainer = document.getElementById('menuItems');
  if (menuItemsContainer) {
    menuItemsContainer.innerHTML = products.map(product => `
      <div class="menu-item" data-category="${product.category?._id || ''}">
        <img src="${product.image ? '/uploads/' + product.image : 'image/placeholder.jpg'}" alt="${product.name}" class="menu-item-img">
        <div class="menu-item-info">
                <h3 class="menu-item-title">${product.name}</h3>
          <p class="menu-item-desc">${product.description}</p>
          <span class="menu-item-price">${product.price.toFixed(2)} TL</span>
          <div class="quantity-control">
            <button onclick="decreaseQuantity('${product._id}')">-</button>
            <input type="number" id="qty-${product._id}" value="1" min="1" class="quantity-input">
            <button onclick="increaseQuantity('${product._id}')">+</button>
          </div>
          <button class="add-to-cart" onclick="addToCart('${product._id}', '${product.name}', ${product.price})">Sepete Ekle</button>
        </div>
      </div>
    `).join('');
  }
}

window.increaseQuantity = function(productId) {
  const input = document.getElementById(`qty-${productId}`);
  input.value = parseInt(input.value) + 1;
}

window.decreaseQuantity = function(productId) {
  const input = document.getElementById(`qty-${productId}`);
  if (parseInt(input.value) > 1) {
    input.value = parseInt(input.value) - 1;
  }
}

function updateUIForLoggedInUser(user) {
  const loginLink = document.getElementById('loginLink');
  if (loginLink) {
    let welcomeText = user.name;
    if (user.registrationMethod === 'google') {
      welcomeText += ' (Google)';
    }
    loginLink.innerHTML = `<i class="fas fa-user"></i> ${welcomeText}`;
    loginLink.href = "#";
  }
  
  const siparislerimLink = document.getElementById('siparislerimLink');
  if (siparislerimLink) {
    siparislerimLink.style.display = 'block';
  }
  
  if (user.role === 'admin') {
    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
      adminLink.style.display = 'block';
    }
    
    const adminPageLink = document.getElementById('adminPageLink');
    if (adminPageLink) {
      adminPageLink.style.display = 'block';
    }
  }
  
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');
  if (loginModal) loginModal.style.display = 'none';
  if (registerModal) registerModal.style.display = 'none';
  
  updateSepetUI();
}

function updateUIForLoggedOutUser() {
  const loginLink = document.getElementById('loginLink');
  if (loginLink) {
    loginLink.innerHTML = `<i class="fas fa-user"></i> Giriş Yap`;
    loginLink.href = "#";
  }
  
  const siparislerimLink = document.getElementById('siparislerimLink');
  if (siparislerimLink) {
    siparislerimLink.style.display = 'none';
  }
  
  const adminLink = document.getElementById('adminLink');
  if (adminLink) {
    adminLink.style.display = 'none';
  }
  
  const adminPageLink = document.getElementById('adminPageLink');
  if (adminPageLink) {
    adminPageLink.style.display = 'none';
  }
}

function checkUserStatus() {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  
  if (user && token) {
    updateUIForLoggedInUser(user);
    
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname === '/') {
      if (user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'login.html';
      }
    }
  } else {
    updateUIForLoggedOutUser();
  }
}

function isUserLoggedIn() {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  return !!(user && token);
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

async function getUserOrders() {
  try {
    const response = await fetch('/api/orders/my-orders', {
      headers: getAuthHeaders()
    });
    
    if (response.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.reload();
      return;
    }
    
    const orders = await response.json();
    return orders;
  } catch (error) {
    console.error('Siparişler yüklenirken hata:', error);
    throw error;
  }
}