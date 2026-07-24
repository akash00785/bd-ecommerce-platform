import { useRef, useState } from 'react';
import AdminLayout from './AdminLayout';
import { useListProducts, useDeleteProduct, useCreateProduct, useUpdateProduct, useListCategories, useListBrands } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

function ProductForm({ initial, onSave, onCancel, categories, brands }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [form, setForm] = useState(initial || {
    title: '', price: '', discountPrice: '', stock: '', images: '',
    categoryId: '', brandId: '', description: '', sizes: '', colors: '',
    warrantyInfo: '', deliveryInfo: '', returnPolicy: '',
    isFeatured: false, isFlashSale: false, flashSalePrice: '', isSoldOut: false,
    type: 'featured',
  });

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const uploadImage = async (file: File) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !preset) { setUploadError('Cloudinary configuration পাওয়া যায়নি।'); return; }
    setUploading(true); setUploadError('');
    try {
      const body = new FormData();
      body.append('file', file); body.append('upload_preset', preset);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body });
      if (!response.ok) throw new Error('Upload failed');
      const result = await response.json();
      set('images', form.images ? `${form.images}, ${result.secure_url}` : result.secure_url);
    } catch { setUploadError('ইমেজ আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'); } finally { setUploading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      stock: Number(form.stock),
      flashSalePrice: form.flashSalePrice ? Number(form.flashSalePrice) : undefined,
      categoryId: Number(form.categoryId),
      brandId: Number(form.brandId),
      images: form.images ? form.images.split(',').map((s: string) => s.trim()) : [],
      sizes: form.sizes ? form.sizes.split(',').map((s: string) => s.trim()) : [],
      colors: form.colors ? form.colors.split(',').map((s: string) => s.trim()) : [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4 max-h-[80vh] overflow-y-auto">
      <h2 className="text-lg font-bold">{initial ? 'প্রোডাক্ট এডিট' : 'নতুন প্রোডাক্ট'}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">টাইটেল *</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.title} onChange={e => set('title', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">মূল্য (৳) *</label>
          <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.price} onChange={e => set('price', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ডিসকাউন্ট মূল্য</label>
          <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.discountPrice} onChange={e => set('discountPrice', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">স্টক *</label>
          <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.stock} onChange={e => set('stock', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ক্যাটাগরি *</label>
          <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.categoryId} onChange={e => set('categoryId', e.target.value)} required>
            <option value="">বেছে নিন</option>
            {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ব্র্যান্ড</label>
          <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.brandId} onChange={e => set('brandId', e.target.value)}>
            <option value="">বেছে নিন</option>
            {brands?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">টাইপ</label>
          <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="featured">Featured</option>
            <option value="new_arrivals">New Arrivals</option>
            <option value="trending">Trending</option>
            <option value="best_sellers">Best Sellers</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">ইমেজ URL (কমা দিয়ে আলাদা করুন)</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.images} onChange={e => set('images', e.target.value)} placeholder="https://..., https://..." />
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadImage(file); e.currentTarget.value = ''; }} />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="mt-2 rounded-lg border border-green-600 text-green-700 px-4 py-2 text-sm hover:bg-green-50 disabled:opacity-60">{uploading ? 'আপলোড হচ্ছে...' : 'Cloudinary থেকে ইমেজ আপলোড'}</button>
          {uploadError && <p className="text-sm text-red-600 mt-1">{uploadError}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">সাইজ (কমা দিয়ে)</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.sizes} onChange={e => set('sizes', e.target.value)} placeholder="S, M, L, XL" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">কালার (কমা দিয়ে)</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.colors} onChange={e => set('colors', e.target.value)} placeholder="Red, Blue, Green" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">বিবরণ</label>
          <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ওয়ারেন্টি</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.warrantyInfo} onChange={e => set('warrantyInfo', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ডেলিভারি তথ্য</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.deliveryInfo} onChange={e => set('deliveryInfo', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">রিটার্ন পলিসি</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.returnPolicy} onChange={e => set('returnPolicy', e.target.value)} />
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isFlashSale} onChange={e => set('isFlashSale', e.target.checked)} />
            Flash Sale
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isSoldOut} onChange={e => set('isSoldOut', e.target.checked)} />
            Sold Out
          </label>
        </div>
        {form.isFlashSale && (
          <div>
            <label className="block text-sm font-medium mb-1">Flash Sale মূল্য</label>
            <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.flashSalePrice} onChange={e => set('flashSalePrice', e.target.value)} />
          </div>
        )}
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700">সেভ করুন</button>
        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm hover:bg-gray-300">বাতিল</button>
      </div>
    </form>
  );
}

export default function AdminProducts() {
  const { data: productsData, refetch } = useListProducts();
  const { data: categories } = useListCategories();
  const { data: brands } = useListBrands();
  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: createProduct } = useCreateProduct();
  const { mutate: updateProduct } = useUpdateProduct();
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const products = (productsData as any)?.products || [];
  const filtered = products.filter((p: any) => p.title.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: number) => {
    if (!confirm('এই প্রোডাক্ট মুছতে চান?')) return;
    deleteProduct({ id }, { onSuccess: () => { refetch(); } });
  };

  const handleSave = (data: any) => {
    if (editProduct) {
      updateProduct({ id: editProduct.id, data }, {
        onSuccess: () => { setEditProduct(null); refetch(); qc.invalidateQueries(); }
      });
    } else {
      createProduct({ data }, {
        onSuccess: () => { setShowForm(false); refetch(); qc.invalidateQueries(); }
      });
    }
  };

  const handleToggle = (product: any, field: string) => {
    updateProduct({ id: product.id, data: { ...product, [field]: !product[field] } }, {
      onSuccess: () => refetch()
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">প্রোডাক্ট ম্যানেজমেন্ট</h1>
          <button onClick={() => setShowForm(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">+ নতুন প্রোডাক্ট</button>
        </div>

        {(showForm && !editProduct) && (
          <ProductForm categories={categories} brands={brands} onSave={handleSave} onCancel={() => setShowForm(false)} />
        )}
        {editProduct && (
          <ProductForm initial={{ ...editProduct, images: editProduct.images?.join(', '), sizes: editProduct.sizes?.join(', '), colors: editProduct.colors?.join(', ') }} categories={categories} brands={brands} onSave={handleSave} onCancel={() => setEditProduct(null)} />
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <input className="border rounded-lg px-3 py-2 text-sm w-72" placeholder="প্রোডাক্ট খুঁজুন..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">প্রোডাক্ট</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">মূল্য</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">স্টক</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">স্ট্যাটাস</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && <img src={p.images[0]} className="w-10 h-10 rounded-lg object-cover" />}
                        <span className="font-medium line-clamp-1 max-w-xs">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">৳{p.discountPrice || p.price}</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.isFeatured && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Featured</span>}
                        {p.isFlashSale && <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">Flash</span>}
                        {p.isSoldOut && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">Sold Out</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditProduct(p)} className="text-blue-600 hover:underline text-xs">এডিট</button>
                        <button onClick={() => handleToggle(p, 'isFeatured')} className="text-purple-600 hover:underline text-xs">Featured</button>
                        <button onClick={() => handleToggle(p, 'isFlashSale')} className="text-orange-600 hover:underline text-xs">Flash</button>
                        <button onClick={() => handleToggle(p, 'isSoldOut')} className="text-gray-600 hover:underline text-xs">Sold Out</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline text-xs">মুছুন</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-gray-400 py-8">কোনো প্রোডাক্ট পাওয়া যায়নি</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
