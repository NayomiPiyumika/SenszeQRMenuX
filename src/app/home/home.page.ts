import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, NavController, ToastController } from '@ionic/angular'; // Import NavController
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit, OnDestroy {
  selectedTab = '';
  products: any[] = [];
  categories: string[] = [];
  filteredProducts: any[] = [];
  private productsSubscription: Subscription | undefined;
  private categorySubscription: Subscription | undefined;
  selectedCategory = '';
  searchTerm: string = '';
  showSearch: boolean = false;
  cartItems: any[] = [];


  constructor(private apiService: ApiService, private navCtrl: NavController, private router: Router, private toastController: ToastController) {     this.loadCart();
  } // Inject NavController

  ngOnInit() {
    this.productsSubscription = this.apiService.getPosts().subscribe(
      (data) => {
        console.log('API data:', data);
        this.products = data;
        this.filterProducts();
      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );

    this.categorySubscription = this.apiService.getPosts().subscribe(
      (data) => {
        const uniqueCategories: Set<string> = new Set(data.map((product: { Category: string }) => product.Category));
        this.categories = Array.from(uniqueCategories);
        if (this.categories.length > 0) {
          this.selectedCategory = this.categories[0];
          this.filterProducts();
        }
      },
      (error) => {
        console.error('Error fetching categories:', error);
      }
    );
  }

  ngOnDestroy() {
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }
    if (this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }
  }

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.filterProducts();
  }

  filterProducts() {
    if (!this.selectedCategory) {
      this.filteredProducts = this.products.map(product => ({
        ...product,
        ImgPath: environment.fileUrl + product.ImgPath,
        _quantity: 0,
        get quantity() {
          return this._quantity;
        },
        set quantity(value) {
          this._quantity = value;
        },
      }));
    } else {
      this.filteredProducts = this.products.filter(item => item.Category === this.selectedCategory).map(product => ({
        ...product,
        ImgPath: environment.fileUrl + product.ImgPath,
        quantity: 0
      }));
    }
  }

  onSegmentChange(event: any) {
    this.selectedTab = event.detail.value;
    this.filterProducts();
  }

  

  tabChange(event: any) {
    console.log('Tab changed:', event);
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.searchTerm = ''; // Clear search when closing
      this.filterProducts();
    }
  }

  hideSearch() {
    this.showSearch = false;
    this.searchTerm = ''; // Clear search when closing
    this.filterProducts();
  }

  searchProducts() {
    if (this.searchTerm.trim()) {
      this.filteredProducts = this.products.filter(product =>
        product.NameOF.toLowerCase().includes(this.searchTerm.toLowerCase())
      ).map(product => ({
        ...product,
        ImgPath: environment.fileUrl + product.ImgPath,
        quantity: 0
      }));
    } else {
      this.filterProducts(); // Show all products if search is empty
    }
  }

  // Navigate to Cart Page
  goToCart() {
    this.navCtrl.navigateForward('/cart'); 
  }
  
  
 
  
  
  
  loadCart() {
    let cartData = localStorage.getItem('cart');
    if (cartData) {
      this.cartItems = JSON.parse(cartData).map((item: any) => ({
        ...item,
        quantity: item.quantity || 1 // Ensure every item has a quantity property
      }));
    } else {
      this.cartItems = [];
    }
  }
  increaseQuantity(product: any) {
    if (!product.tempQuantity) {
      product.tempQuantity = 1; // Start from 1 if not set
    } else {
      product.tempQuantity += 1; // Increase temp quantity
    }
  }
  
  decreaseQuantity(product: any) {
    if (product.tempQuantity && product.tempQuantity > 1) {
      product.tempQuantity -= 1; // Decrease temp quantity
    } else {
      product.tempQuantity = 0; // Ensure it stays at 1
    }
  }
  
  addToCart(product: any) {
    if (!product || !product.NameOF || !product.ImgPath || !product.SellingPrice) {
      console.error("Invalid product data", product);
      return;
    }

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    let existingProduct = cart.find((item: any) => item.NameOF === product.NameOF);
    if (existingProduct) {
      this.showToast('Already in the cart!', 'warning'); // ✅ Show "Already in the cart" message
    } else {
      product.quantity = product.tempQuantity || 1; // Use selected quantity
      cart.push(product);
      localStorage.setItem('cart', JSON.stringify(cart));
      this.loadCart(); // Update UI
      product.tempQuantity = 0; // Reset quantity to 0 after adding to cart

      this.showToast('Added to cart successfully!', 'success'); // ✅ Show success message
    }
  }
  
  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000, // Show for 2 seconds
      position: 'bottom',
      color: color, // 'success' for success, 'warning' for already in cart
    });

    await toast.present();
  }
  
  onImageError(event: any) {
    event.target.src = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';
  }
  

}
