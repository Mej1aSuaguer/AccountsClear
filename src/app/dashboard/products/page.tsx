// src/app/dashboard/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/firebase/provider';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Product, ProductCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2 } from 'lucide-react';

const categories: ProductCategory[] = ['cervezas', 'licores', 'shots', 'botellas', 'comidas', 'combos', 'otros'];

export default function ProductsPage() {
  const { userData } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'cervezas' as ProductCategory,
    price: 0,
    stock: 0,
  });

  useEffect(() => {
    if (!userData?.barId) return;

    const q = query(
      collection(db, 'products'),
      where('barId', '==', userData.barId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.barId]);

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.barId || !formData.name) return;

    const productData = {
      barId: userData.barId,
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      stock: Number(formData.stock),
      isActive: true,
      updatedAt: new Date()
    };

    if (editingProduct) {
      await updateDoc(doc(db, 'products', editingProduct.id), productData);
    } else {
      await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: new Date()
      });
    }

    setShowForm(false);
    setEditingProduct(null);
    setFormData({ name: '', category: 'cervezas', price: 0, stock: 0 });
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock || 0,
    });
    setShowForm(true);
  };

  const toggleActive = async (productId: string, currentStatus: boolean) => {
    await updateDoc(doc(db, 'products', productId), {
      isActive: !currentStatus,
      updatedAt: new Date()
    });
  };

  if (loading) return <p>Cargando menú...</p>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Menú / Productos</h1>
          <p className="text-zinc-400">{products.length} productos activos</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </Button>
      </div>

      {/* Formulario */}
      {showForm && (
        <Card className="bg-zinc-900 border-emerald-900/50">
          <CardHeader>
            <CardTitle>{editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Nombre del Producto</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Cerveza Pola 330ml"
                  required
                />
              </div>

              <div>
                <Label>Categoría</Label>
                <select
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-3 text-sm"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Precio ($ COP)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label>Stock (opcional)</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <Button type="submit" className="flex-1 bg-emerald-600">
                  {editingProduct ? 'Guardar Cambios' : 'Agregar al Menú'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {setShowForm(false); setEditingProduct(null);}}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <Badge variant="outline">{product.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold text-emerald-400">
                    ${product.price.toLocaleString('es-CO')}
                  </p>
                  {product.stock && <p className="text-xs text-zinc-500">Stock: {product.stock}</p>}
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" size="icon" onClick={() => editProduct(product)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Switch
                    checked={product.isActive}
                    onCheckedChange={() => toggleActive(product.id, product.isActive)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && !showForm && (
        <Card className="bg-zinc-900 border-zinc-800 p-16 text-center">
          <p className="text-zinc-400">Aún no tienes productos en el menú.</p>
          <Button onClick={() => setShowForm(true)} className="mt-6">Agregar Primer Producto</Button>
        </Card>
      )}
    </div>
  );
}