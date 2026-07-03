import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./products.css";
import Modal from "../../../Component/Modal/Modal";
import {
  getItems,
  createItem,
  updateItem,
  deleteItem
} from "../../../services/itemsService";
import { getCategories } from "../../../services/categoriesService";
import {
  showSuccess,
  showError,
  showConfirm
} from "../../../Component/toast/Toast";

// أيقونات
import { FaPlus, FaEdit, FaTrash, FaImage } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";

// ✅ استيراد مؤشر التحميل الدائري
import LoadingSpinner from "../../../Component/LoadingSpinner/LoadingSpinner";

// ✅ استيراد الخطاف للتحكم في الستارة
import { useSidebar } from "../../../context/SidebarContext";

export default function Products() {
  const { openMobile } = useSidebar();

  // الحالة للبيانات
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  // حالة المودال
  const [modalOpen, setModalOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // حقول النموذج
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // حالة القائمة المنسدلة للتصنيفات
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const fileInputRef = useRef(null);

  // جلب الأصناف والتصنيفات عند تحميل الصفحة
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, categoriesRes] = await Promise.all([
          getItems(),
          getCategories()
        ]);
        setItems(itemsRes.data.data);
        setCategories(categoriesRes.data.data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        showError("فشل في جلب البيانات");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, []);

  // إعادة تعيين الحقول
  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice(0);
    setCategory("");
    setImage("");
    setIsAvailable(true);
    setEditingItem(null);
    setCategoryDropdownOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCloseModal = () => {
    resetForm();
    setModalOpen(false);
  };

  // رفع الصورة إلى Cloudinary
  const uploadImage = async (file, inputEl) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");

    setImageUploading(true);
    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dsnygnwcv/image/upload",
        formData
      );
      const imageUrl = res.data.secure_url;
      setImage(imageUrl);
      inputEl.value = "";
      showSuccess("تم رفع الصورة بنجاح");
    } catch (err) {
      console.error(err);
      showError("فشل رفع الصورة");
    } finally {
      setImageUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) uploadImage(file, e.target);
  };

  // فتح المودال لتعديل صنف
  const handleEdit = (item) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description?.join("\n") || "");
    setPrice(item.price);
    setCategory(item.category?._id || item.category || "");
    setImage(item.image || "");
    setIsAvailable(item.isAvailable);
    setModalOpen(true);
  };

  // تنظيف النص من الرموز
  const cleanDescriptionLine = (line) => {
    if (!line) return "";
    return line
      .replace(/^[^ء-يa-zA-Z]+/, "")
      .replace(/[^ء-يa-zA-Z]+$/, "")
      .trim();
  };

  // إرسال النموذج (إضافة أو تعديل)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showError("اسم الصنف مطلوب");
      return;
    }
    if (!category) {
      showError("يرجى اختيار تصنيف");
      return;
    }

    const itemData = {
      name: name.trim(),
      description: description
        .split("\n")
        .map((line) => cleanDescriptionLine(line))
        .filter((line) => line !== ""),
      price: Number(price),
      category: category,
      image: image,
      isAvailable: isAvailable
    };

    try {
      setSaveLoading(true);

      if (editingItem) {
        const { data } = await updateItem(editingItem._id, itemData);
        setItems((prev) =>
          prev.map((item) => (item._id === editingItem._id ? data.data : item))
        );
        showSuccess("تم تحديث الصنف بنجاح");
      } else {
        const { data } = await createItem(itemData);
        setItems((prev) => [...prev, data.data]);
        showSuccess("تم إضافة الصنف بنجاح");
      }

      resetForm();
      setModalOpen(false);
    } catch (err) {
      showError(err.response?.data?.message || "حدث خطأ ما");
    } finally {
      setSaveLoading(false);
    }
  };

  // حذف صنف مع تأكيد
  const handleDelete = (id) => {
    showConfirm(
      "هل أنت متأكد من حذف هذا الصنف؟",
      "تأكيد الحذف",
      async () => {
        try {
          await deleteItem(id);
          setItems((prev) => prev.filter((item) => item._id !== id));
          showSuccess("تم حذف الصنف بنجاح");
        } catch (err) {
          showError(err.response?.data?.message || "فشل حذف الصنف");
        }
      },
      () => {}
    );
  };

  // دالة استخراج اسم التصنيف
  const getCategoryName = (categoryField) => {
    if (!categoryField) return "بدون تصنيف";
    const id =
      typeof categoryField === "object" ? categoryField._id : categoryField;
    const found = categories.find((cat) => cat._id === id);
    return found ? found.name : "بدون تصنيف";
  };

  // دوال القائمة المنسدلة المخصصة
  const handleCategorySelect = (catId) => {
    setCategory(catId);
    setCategoryDropdownOpen(false);
  };

  const getSelectedCategoryName = () => {
    if (!category) return "اختر تصنيفاً";
    const cat = categories.find((c) => c._id === category);
    return cat ? cat.name : "اختر تصنيفاً";
  };

  return (
    <div>
      {/* شريط التنقل العلوي */}
      <div className="NavBar-Products">
        <div className="text-NavBar">
          <h3>الأصناف</h3>
          <p>أدر قائمة الأصناف الخاصة بك</p>
        </div>
        <div className="button-NavBar">
          <button
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            className="add-Products-btn"
          >
            اضافة صنف
            <FaPlus />
          </button>
          <button className="mobile-menu-btn" onClick={openMobile}>
            <GiHamburgerMenu />
          </button>
        </div>
      </div>

      {/* عرض الأصناف كبطاقات */}
      <div className="products-container">
        {fetchLoading ? (
          <LoadingSpinner text="جاري تحميل الأصناف..." />
        ) : items.length === 0 ? (
          <p className="empty-text">لا توجد أصناف بعد</p>
        ) : (
          <div className="products-grid">
            {items.map((item) => (
              <div key={item._id} className="product-card">
                <div className="product-card-img">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="no-image">
                      <FaImage />
                      <span>لا صورة</span>
                    </div>
                  )}
                  <span
                    className={`availability-badge ${
                      item.isAvailable ? "available" : "unavailable"
                    }`}
                  >
                    {item.isAvailable ? "متاح" : "غير متاح"}
                  </span>
                </div>
                <div className="product-card-body">
                  <h4 className="product-name">{item.name}</h4>
                  <p className="product-category">
                    {getCategoryName(item.category)}
                  </p>
                  <p className="product-price">
                    <span>ل.س</span>
                    <span> {item.price.toLocaleString()}</span>
                  </p>
                  <div className="product-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(item)}
                      title="تعديل"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(item._id)}
                      title="حذف"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* مودال إضافة / تعديل صنف */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          {editingItem ? "تعديل الصنف" : "إضافة صنف جديد"}
        </h2>
        <div className="Products">
          <form onSubmit={handleSubmit}>
            {/* اسم الصنف */}
            <div className="box-input-Products">
              <label>اسم الصنف</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* الوصف */}
            <div className="box-input-Products">
              <label>الوصف (كل سطر نقطة منفصلة)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="1"
                placeholder="أدخل وصفاً لكل سطر"
              />
            </div>

            {/* السعر */}
            <div className="box-input-Products">
              <label>السعر</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            {/* اختيار التصنيف - القائمة المنسدلة المخصصة */}
            <div className="box-input-Products">
              <label>التصنيف</label>
              <div className="custom-dropdown">
                <button
                  type="button"
                  className="dropdown-button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                >
                  <span>{getSelectedCategoryName()}</span>
                  <span
                    className={`arrow ${categoryDropdownOpen ? "open" : ""}`}
                  >
                    ▼
                  </span>
                </button>
                {categoryDropdownOpen && (
                  <ul className="dropdown-options">
                    {categories.map((cat) => (
                      <li
                        key={cat._id}
                        className={`dropdown-option ${category === cat._id ? "active" : ""}`}
                        onClick={() => handleCategorySelect(cat._id)}
                      >
                        {cat.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* متاح للطلب */}
            <div className="box-input checkbox-row">
              <div className="box-checkbox">
                <div>
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                  />
                </div>
                <div>
                  <p>متاح للطلب</p>
                </div>
              </div>
            </div>

            {/* الصورة */}
            <div className="form-group">
              <label>الصورة</label>
              {image ? (
                <div className="image-preview">
                  <img src={image} alt="Preview" />
                  <button type="button" onClick={() => setImage("")}>
                    إزالة
                  </button>
                </div>
              ) : (
                <div className="Add-img">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    id="item-image-input"
                  />
                  <label
                    htmlFor="item-image-input"
                    className={`custom-upload-btn ${
                      imageUploading ? "disabled" : ""
                    }`}
                  >
                    اختر صورة
                  </label>
                  {imageUploading && <span className="upload-spinner"></span>}
                </div>
              )}
            </div>

            {/* أزرار التحكم */}
            <div className="form-actions">
              <button type="submit" disabled={saveLoading}>
                {saveLoading
                  ? "جاري الحفظ..."
                  : editingItem
                    ? "حفظ التعديلات"
                    : "حفظ"}
              </button>
              <button type="button" onClick={handleCloseModal}>
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
