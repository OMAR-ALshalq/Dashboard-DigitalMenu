import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Categories.css";
import Modal from "../../../Component/Modal/Modal";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "../../../services/categoriesService";
import {
  showSuccess,
  showError,
  showConfirm
} from "../../../Component/toast/Toast";

import { useSidebar } from "../../../context/SidebarContext";

// أيقونات
import { TbCategoryPlus, TbCategoryMinus } from "react-icons/tb";
import { FaImage, FaEdit } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";

// ✅ استيراد مؤشر التحميل الدائري
import LoadingSpinner from "../../../Component/LoadingSpinner/LoadingSpinner";

export default function Categories() {
  const { openMobile } = useSidebar();

  const [categories, setCategories] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // الحقول
  const [name, setName] = useState("");
  const [order, setOrder] = useState(0);
  const [image, setImage] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const fileInputRef = useRef(null);

  // جلب التصنيفات
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await getCategories();
        setCategories(data.data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        showError("فشل في جلب التصنيفات");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // إعادة تعيين جميع الحقول وحالة التعديل
  const resetForm = () => {
    setName("");
    setOrder(0);
    setImage("");
    setEditingCategory(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCloseModal = () => {
    resetForm();
    setModalOpen(false);
  };

  // رفع الصورة (بدون تغيير)
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
      setImage(res.data.secure_url);
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

  const handleEdit = (category) => {
    setEditingCategory(category);
    setName(category.name);
    setOrder(category.order);
    setImage(category.image || "");
    setModalOpen(true);
  };

  // إرسال النموذج (إضافة أو تعديل)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showError("اسم التصنيف مطلوب");
      return;
    }

    const categoryData = {
      name: name.trim(),
      order: order,
      image: image
    };

    try {
      setSaveLoading(true);

      if (editingCategory) {
        const { data } = await updateCategory(
          editingCategory._id,
          categoryData
        );
        setCategories((prev) =>
          prev.map((cat) => (cat._id === editingCategory._id ? data.data : cat))
        );
        showSuccess("تم تحديث التصنيف بنجاح");
      } else {
        const { data } = await createCategory(categoryData);
        setCategories((prev) => [...prev, data.data]);
        showSuccess("تم إضافة التصنيف بنجاح");
      }

      resetForm();
      setModalOpen(false);
    } catch (err) {
      showError(err.response?.data?.message || "حدث خطأ ما");
    } finally {
      setSaveLoading(false);
    }
  };

  // ✅ دالة الحذف مع توست تأكيدي
  const handleDelete = (id) => {
    showConfirm(
      "هل أنت متأكد من حذف هذا التصنيف؟",
      "تأكيد الحذف",
      async () => {
        try {
          await deleteCategory(id);
          setCategories((prev) => prev.filter((cat) => cat._id !== id));
          showSuccess("تم حذف التصنيف بنجاح");
        } catch (err) {
          showError(err.response?.data?.message || "فشل حذف التصنيف");
        }
      },
      () => {}
    );
  };

  return (
    <div>
      {/* شريط التنقل العلوي */}
      <div className="NavBar-Categories">
        <div className="text-NavBar">
          <h3>التصنيفات</h3>
          <p>أدر قائمة التصنيفات الخاصة بك</p>
        </div>
        <div className="button-NavBar">
          <button
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            className="add-category-btn"
          >
            اضافة تصنيف
            <TbCategoryPlus />
          </button>
          <button className="mobile-menu-btn" onClick={openMobile}>
            <GiHamburgerMenu />
          </button>
        </div>
      </div>

      {/* عرض التصنيفات */}
      <div className="AllCategory" dir="rtl">
        {fetchLoading ? (
          <LoadingSpinner text="جاري تحميل التصنيفات..." />
        ) : categories.length === 0 ? (
          <p className="empty-text">لا توجد تصنيفات بعد</p>
        ) : (
          <div className="category-grid">
            {categories.map((cat) => (
              <div key={cat._id} className="category-card">
                <div className="card-img">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} />
                  ) : (
                    <div className="no-img">
                      <FaImage />
                      <span>لا توجد صورة</span>
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <h4>{cat.name}</h4>
                  <div className="card-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(cat)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(cat._id)}
                    >
                      <TbCategoryMinus />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* مودال إضافة / تعديل تصنيف */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          {editingCategory ? "تعديل التصنيف" : "إضافة تصنيف"}
        </h2>
        <div className="category">
          <form onSubmit={handleSubmit}>
            <div className="box-input">
              <label>اسم التصنيف</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="box-input">
              <label>الترتيب</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
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
                    id="category-image-input"
                  />
                  <label
                    htmlFor="category-image-input"
                    className={`custom-upload-btn ${imageUploading ? "disabled" : ""}`}
                  >
                    اختر صورة
                  </label>
                  {imageUploading && <span className="upload-spinner"></span>}
                </div>
              )}
            </div>
            <div className="form-actions">
              <button type="submit" disabled={saveLoading}>
                {saveLoading
                  ? "جاري الحفظ..."
                  : editingCategory
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
