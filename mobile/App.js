import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  FlatList, 
  ActivityIndicator,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Fallback high-quality shoe catalog mock data if backend fetch is unreachable
const MOCK_PRODUCTS = [
  {
    _id: "prod1",
    name: "Porsche Sneaker Concept",
    brand: "Porsche",
    price: 159.00,
    salePrice: 124.00,
    rating: 4.8,
    inventory: 12,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff"],
    category: "For Him",
    description: "Aerodynamic silhouette with seamless fits, built with high elastic performance polymers."
  },
  {
    _id: "prod2",
    name: "Nike Dunk Low Pink",
    brand: "Nike",
    price: 130.00,
    salePrice: 110.00,
    rating: 4.6,
    inventory: 8,
    images: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa"],
    category: "For Her",
    description: "Premium leather panels with clean pink palettes and vintage white laces."
  },
  {
    _id: "prod3",
    name: "Yeezy Style Sneaker",
    brand: "Adidas",
    price: 220.00,
    rating: 4.7,
    inventory: 5,
    images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a"],
    category: "Unisex",
    description: "Woven Primeknit mesh shoes with high cushion boost technology."
  },
  {
    _id: "prod4",
    name: "Ninja Runner Black",
    brand: "Reebok",
    price: 145.00,
    rating: 4.5,
    inventory: 0,
    images: ["https://images.unsplash.com/photo-1539185441755-769473a23570"],
    category: "For Him",
    description: "Stealth charcoal lightweight upper, built for night-time urban exploration."
  }
];

export default function App() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Detail Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const API_IP = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  const API_URL = `http://${API_IP}:5000/api/products`;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setProducts(data);
        }
      }
    } catch (error) {
      console.log("Network API unreachable. Using high-aesthetic mock catalog details:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = selectedCategory === 'All' || 
                       p.category?.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCat;
  });

  const renderProductItem = ({ item }) => {
    const hasSale = item.salePrice && item.salePrice < item.price;
    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => {
          setSelectedProduct(item);
          setModalVisible(true);
        }}
      >
        {/* Sale badge */}
        {hasSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>SALE</Text>
          </View>
        )}

        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.images[0] }} style={styles.productImage} resizeMode="contain" />
        </View>

        <View style={styles.cardMeta}>
          <Text style={styles.brandText}>{item.brand.toUpperCase()}</Text>
          <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
          
          <View style={styles.priceContainer}>
            {hasSale ? (
              <View style={styles.priceRow}>
                <Text style={styles.slashedPrice}>₹{item.price.toFixed(0)}</Text>
                <Text style={styles.salePrice}>₹{item.salePrice.toFixed(0)}</Text>
              </View>
            ) : (
              <Text style={styles.normalPrice}>₹{item.price.toFixed(0)}</Text>
            )}
            
            <Text style={styles.ratingText}>★ {item.rating || 4.5}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 1. Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SANP SHOES</Text>
          <Text style={styles.headerSubtitle}>PREMIUM SNEAKER CONCEPTS</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchProducts}>
          <Text style={styles.refreshText}>SYNC</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Search Box */}
      <View style={styles.searchContainer}>
        <TextInput 
          placeholder="Search catalog..." 
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* 3. Category Bar */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {['All', 'For Him', 'For Her', 'For Kids', 'Unisex'].map((cat) => (
            <TouchableOpacity 
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.categoryTab, selectedCategory === cat && styles.activeCategoryTab]}
            >
              <Text style={[styles.categoryTabText, selectedCategory === cat && styles.activeCategoryTabText]}>
                {cat.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 4. Loader or List */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ff5a00" />
          <Text style={styles.loaderText}>Syncing footwear inventory...</Text>
        </View>
      ) : (
        <FlatList 
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.listRow}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No shoes match your selection</Text>
            </View>
          }
        />
      )}

      {/* 5. Shoe Details Modal */}
      {selectedProduct && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              
              {/* Modal Drag Bar / Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Product Specifications</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>CLOSE</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll}>
                
                {/* Large Product image */}
                <View style={styles.modalImageContainer}>
                  <Image source={{ uri: selectedProduct.images[0] }} style={styles.modalImage} resizeMode="contain" />
                </View>

                {/* Details info */}
                <View style={styles.modalDetails}>
                  <Text style={styles.modalBrand}>{selectedProduct.brand.toUpperCase()}</Text>
                  <Text style={styles.modalName}>{selectedProduct.name}</Text>
                  
                  <View style={styles.modalPriceContainer}>
                    {selectedProduct.salePrice ? (
                      <View style={styles.priceRow}>
                        <Text style={[styles.salePrice, { fontSize: 20 }]}>₹{selectedProduct.salePrice.toFixed(0)}</Text>
                        <Text style={[styles.slashedPrice, { fontSize: 14, marginLeft: 8 }]}>₹{selectedProduct.price.toFixed(0)}</Text>
                      </View>
                    ) : (
                      <Text style={[styles.normalPrice, { fontSize: 20 }]}>₹{selectedProduct.price.toFixed(0)}</Text>
                    )}
                    
                    <Text style={styles.modalRating}>★ {selectedProduct.rating || 4.5}</Text>
                  </View>

                  <Text style={styles.modalDescHeader}>Description</Text>
                  <Text style={styles.modalDesc}>{selectedProduct.description}</Text>

                  {/* Stock status */}
                  <View style={styles.stockStatusContainer}>
                    <Text style={[styles.stockStatusText, { color: selectedProduct.inventory > 0 ? '#10b981' : '#ef4444' }]}>
                      {selectedProduct.inventory > 0 ? `IN STOCK (${selectedProduct.inventory} available)` : 'OUT OF STOCK'}
                    </Text>
                  </View>

                  {/* Cart Action button */}
                  <TouchableOpacity 
                    style={[styles.actionButton, selectedProduct.inventory === 0 && styles.disabledButton]}
                    disabled={selectedProduct.inventory === 0}
                    onPress={() => {
                      alert(`Added "${selectedProduct.name}" to cart (Simulated)`);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.actionButtonText}>
                      {selectedProduct.inventory > 0 ? 'ADD TO CART BAG' : 'OUT OF STOCK'}
                    </Text>
                  </TouchableOpacity>

                </View>

              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafaf9',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0ede9',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 8,
    fontWeight: '800',
    color: '#ff5a00',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1.2,
    borderColor: '#1a1a1a',
  },
  refreshText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#1a1a1a',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f5f4f0',
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0ede9',
  },
  categoryScroll: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 6,
  },
  activeCategoryTab: {
    backgroundColor: '#1a1a1a',
  },
  categoryTabText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#777',
    letterSpacing: 1,
  },
  activeCategoryTabText: {
    color: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#888',
    marginTop: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 15,
  },
  listRow: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    width: '48%',
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  saleBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#ff5a00',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 10,
  },
  saleBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  imageWrapper: {
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fbfbfa',
    borderRadius: 8,
    marginBottom: 8,
  },
  productImage: {
    width: '90%',
    height: '90%',
  },
  cardMeta: {
    paddingHorizontal: 2,
  },
  brandText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#aaa',
    letterSpacing: 0.8,
  },
  nameText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1a1a1a',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slashedPrice: {
    fontSize: 10,
    textDecorationLine: 'line-through',
    color: '#aaa',
    marginRight: 4,
  },
  salePrice: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ef4444',
  },
  normalPrice: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  ratingText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#eab308',
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#bbb',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0ede9',
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#1a1a1a',
    textTransform: 'uppercase',
  },
  closeButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#f5f4f0',
  },
  closeButtonText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#777',
    letterSpacing: 0.5,
  },
  modalScroll: {
    padding: 20,
  },
  modalImageContainer: {
    height: 200,
    backgroundColor: '#fafaf9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalImage: {
    width: '85%',
    height: '85%',
  },
  modalDetails: {
    paddingBottom: 40,
  },
  modalBrand: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ff5a00',
    letterSpacing: 1,
  },
  modalName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
    marginTop: 4,
  },
  modalPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
    backgroundColor: '#fafaf9',
    padding: 12,
    borderRadius: 12,
  },
  modalRating: {
    fontSize: 12,
    fontWeight: '800',
    color: '#eab308',
  },
  modalDescHeader: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 15,
  },
  stockStatusContainer: {
    marginBottom: 20,
  },
  stockStatusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  actionButton: {
    backgroundColor: '#ff5a00',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#ff5a00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  }
});
