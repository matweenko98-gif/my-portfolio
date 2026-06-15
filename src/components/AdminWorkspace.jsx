import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, Trash2, Upload, Loader2, ArrowLeft, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';

// Simple Image Upload component for clean modular state
function ImageUpload({ label, value, onChange, onError, pathPrefix = 'case' }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${pathPrefix}-${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('case-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('case-images')
        .getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      if (onError) {
        onError('Ошибка при\u00a0загрузке изображения: ' + err.message);
      } else {
        alert('Ошибка при\u00a0загрузке изображения: ' + err.message);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative w-16 h-16 border border-zinc-200 rounded-sm overflow-hidden bg-neutral-50 shrink-0">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[10px] transition-opacity duration-200"
            >
              Удалить
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 border border-dashed border-zinc-300 rounded-sm flex items-center justify-center bg-zinc-50 shrink-0 text-zinc-400 text-xs">
            Нет фото
          </div>
        )}
        
        <div className="flex-1">
          {uploading ? (
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Загрузка в Storage...</span>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-zinc-200 hover:border-black rounded-sm text-xs font-medium cursor-pointer transition-colors bg-white shadow-sm">
              <Upload className="w-3.5 h-3.5" />
              <span>{value ? 'Заменить изображение' : 'Выбрать файл'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
          {value && (
            <span className="block text-[10px] text-zinc-400 mt-1 truncate max-w-xs md:max-w-md">
              URL: {value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminWorkspace() {
  // Cases list state (left panel)
  const [casesList, setCasesList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // Edit Mode state
  const [editingId, setEditingId] = useState(null);

  // Drag-and-drop state
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Form states (right panel)
  const [slug, setSlug] = useState('');
  const [isInDevelopment, setIsInDevelopment] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [heroImage, setHeroImage] = useState('');

  // Preview Card fields
  const [cardTitle, setCardTitle] = useState('');
  const [cardImage, setCardImage] = useState('');
  const [cardTags, setCardTags] = useState('');
  
  // Metadata state
  const [sphere, setSphere] = useState('');
  const [type, setType] = useState('');
  const [stack, setStack] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [shortBio, setShortBio] = useState('');

  // Task & Solution
  const [task, setTask] = useState('');
  const [solution, setSolution] = useState('');
  const [liveUrl, setLiveUrl] = useState('');

  // Visibility Toggles aligned to current structures
  const [visibility, setVisibility] = useState({
    process: true,
    challenge: true,
    desktop: true,
    mobile: true,
    panorama: true,
    outro: true,
    custom: true
  });

  // Dynamic arrays
  const [processSteps, setProcessSteps] = useState([]);
  const [desktopFeatures, setDesktopFeatures] = useState([]);
  const [mobileFeatures, setMobileFeatures] = useState([]);
  
  // Panorama state
  const [panorama, setPanorama] = useState([]);

  // Outro State
  const [outroImages, setOutroImages] = useState([]);

  // Custom Blocks state
  const [customBlocks, setCustomBlocks] = useState([]);

  // Submission load state
  const [publishing, setPublishing] = useState(false);

  // Tab control state
  const [activeTab, setActiveTab] = useState('cases');

  // Other projects states
  const [otherProjects, setOtherProjects] = useState([]);
  const [loadingOther, setLoadingOther] = useState(true);
  const [otherProjToDelete, setOtherProjToDelete] = useState(null);

  // Other project edit state
  const [editingOtherId, setEditingOtherId] = useState(null);
  const [otherNum, setOtherNum] = useState('');
  const [otherTitle, setOtherTitle] = useState('');
  const [otherDescription, setOtherDescription] = useState('');
  const [otherLinkUrl, setOtherLinkUrl] = useState('');
  const [savingOther, setSavingOther] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  // Item to delete state
  const [itemToDelete, setItemToDelete] = useState(null);

  // Auto dismiss toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Load existing cases sorted by sort_order
  const fetchCases = async () => {
    setLoadingList(true);
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('id, slug, title, card_title, sort_order')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCasesList(data || []);
    } catch (err) {
      console.error('Error fetching cases:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const seedOtherProjects = async () => {
    try {
      const defaultProjects = [
        {
          num: "01",
          title: "Интернет-магазин одежды FORME",
          description: "Онлайн-магазин одежды с\u00a0фокусом на\u00a0форму, посадку и\u00a0визуальную чистоту. Проект ориентирован на\u00a0аудиторию, для\u00a0которой важны не тренды «на\u00a0один сезон», а\u00a0силуэт, качество и\u00a0ощущение собранного образа.",
          link_url: "",
          sort_order: 0
        },
        {
          num: "02",
          title: "Типография цифровых решений",
          description: "Многостраничный сайт. Основной фокус — B2B-клиенты, для\u00a0которых важны скорость, качество, точная цветопередача и\u00a0надёжность подрядчика.",
          link_url: "",
          sort_order: 1
        },
        {
          num: "03",
          title: "Корпоративный сайт косметологического кабинета",
          description: "Косметологический кабинет для\u00a0девушек с\u00a0проблемной, чувствительной и\u00a0реактивной кожей. Формат — частный специалист. Сайт должен был работать как\u00a0система: объяснять подход специалиста, показывать логику работы с\u00a0кожей и\u00a0формировать ощущение безопасного пространства.",
          link_url: "",
          sort_order: 2
        },
        {
          num: "04",
          title: "Nempl — автоматизация бизнеса",
          description: "Nempl — компания, занимающаяся внедрением ИИ-сотрудников для\u00a0автоматизации продаж и\u00a0бизнес-процессов. Основной продукт — ИИ-ассистенты для\u00a0отделов продаж, поддержки и\u00a0коммуникаций, интегрируемые с\u00a0CRM и\u00a0мессенджерами.",
          link_url: "",
          sort_order: 3
        }
      ];

      const { error } = await supabase
        .from('other_projects')
        .insert(defaultProjects);
      
      if (error) throw error;
    } catch (err) {
      console.error('Error seeding other projects:', err);
    }
  };

  const fetchOtherProjects = async () => {
    setLoadingOther(true);
    try {
      const { data, error } = await supabase
        .from('other_projects')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      
      if (data && data.length > 0) {
        setOtherProjects(data);
      } else {
        await seedOtherProjects();
        const { data: refetched } = await supabase
          .from('other_projects')
          .select('*')
          .order('sort_order', { ascending: true });
        setOtherProjects(refetched || []);
      }
    } catch (err) {
      console.error('Error fetching other projects:', err);
    } finally {
      setLoadingOther(false);
    }
  };

  useEffect(() => {
    fetchCases();
    fetchOtherProjects();
  }, []);

  // Deletion handler
  const handleDeleteCase = async (id, slug) => {
    try {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setToast({ show: true, message: `Кейс ${slug} успешно удален.`, type: 'success' });
      if (editingId === id) {
        resetForm();
      }
      fetchCases();
    } catch (err) {
      console.error('Delete error:', err);
      setToast({ show: true, message: 'Ошибка при\u00a0удалении: ' + err.message, type: 'error' });
    }
  };

  // Re-ordering logic (swapping sort_order)
  const handleMoveCase = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= casesList.length) return;

    const currentItem = casesList[index];
    const targetItem = casesList[targetIndex];

    try {
      let currentSort = currentItem.sort_order !== null && currentItem.sort_order !== undefined ? currentItem.sort_order : 0;
      let targetSort = targetItem.sort_order !== null && targetItem.sort_order !== undefined ? targetItem.sort_order : 0;

      if (currentSort === targetSort) {
        if (direction === 'up') {
          currentSort = targetSort - 1;
        } else {
          currentSort = targetSort + 1;
        }
      } else {
        const temp = currentSort;
        currentSort = targetSort;
        targetSort = temp;
      }

      // Update currentItem sort_order
      const { error: err1 } = await supabase
        .from('cases')
        .update({ sort_order: currentSort })
        .eq('id', currentItem.id);

      if (err1) throw err1;

      // Update targetItem sort_order
      const { error: err2 } = await supabase
        .from('cases')
        .update({ sort_order: targetSort })
        .eq('id', targetItem.id);

      if (err2) throw err2;

      fetchCases();
    } catch (err) {
      console.error('Error swapping positions:', err);
      setToast({ show: true, message: 'Ошибка при\u00a0перемещении: ' + err.message, type: 'error' });
    }
  };

  // Edit Mode starter
  const handleStartEdit = async (item) => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', item.id)
        .single();

      if (error) throw error;

      setEditingId(data.id);
      setSlug(data.slug || '');
      setIsInDevelopment(!!data.is_in_development);
      setTitle(data.title || '');
      setSubtitle(data.subtitle || '');
      setHeroImage(data.heroImage || '');

      // Load Preview Card fields
      setCardTitle(data.card_title || '');
      setCardImage(data.card_image || '');
      setCardTags(Array.isArray(data.card_tags) ? data.card_tags.join(', ') : (data.card_tags || ''));
      
      // Metadata
      setSphere(data.meta?.sphere || '');
      setType(data.meta?.type || '');
      setStack(data.meta?.stack || '');
      setYear(data.meta?.year || '');
      setShortBio(data.about?.text || '');

      // Task & Solution
      setTask(data.challenge?.task || '');
      setSolution(data.challenge?.solution || '');
      setLiveUrl(data.challenge?.liveUrl || '');

      // Visibility toggles
      setVisibility({
        process: data.visibility?.process !== false,
        challenge: data.visibility?.challenge !== false,
        desktop: data.visibility?.desktop !== false,
        mobile: data.visibility?.mobile !== false,
        panorama: data.visibility?.panorama !== false,
        outro: data.visibility?.outro !== false,
        custom: data.visibility?.custom !== false
      });

      // Process steps formatting (tags as string for inputs)
      const formattedSteps = (data.process || []).map(step => ({
        ...step,
        tags: Array.isArray(step.tags) ? step.tags.join(', ') : (step.tags || '')
      }));
      setProcessSteps(formattedSteps);

      // Arrays and graphics
      setDesktopFeatures(data.features || []);
      setMobileFeatures(data.mobile_features || []);
      setPanorama(data.panorama_images || []);
      const fetchedOutro = data.outro?.images || (data.outro?.image ? [data.outro.image] : []);
      setOutroImages(fetchedOutro);
      setCustomBlocks(data.custom_blocks || []);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error loading case for edit:', err);
      setToast({ show: true, message: 'Не удалось загрузить данные кейса: ' + err.message, type: 'error' });
    }
  };

  const smoothScrollToElement = (elementId) => {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Drag and drop event handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const reorderedList = [...casesList];
    const [draggedItem] = reorderedList.splice(draggedIndex, 1);
    reorderedList.splice(targetIndex, 0, draggedItem);

    try {
      setLoadingList(true);
      const updatePromises = reorderedList.map((item, idx) => {
        return supabase
          .from('cases')
          .update({ sort_order: idx })
          .eq('id', item.id);
      });

      const results = await Promise.all(updatePromises);
      const firstError = results.find(r => r.error);
      if (firstError) throw firstError.error;

      setToast({ show: true, message: 'Порядок кейсов успешно изменен!', type: 'success' });
      fetchCases();
    } catch (err) {
      console.error('Error updating positions after drag & drop:', err);
      setToast({ show: true, message: 'Ошибка при\u00a0перетаскивании: ' + err.message, type: 'error' });
    } finally {
      setDraggedIndex(null);
      setLoadingList(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Add items dynamically to arrays
  const addProcessStep = () => {
    const nextIdx = processSteps.length;
    setProcessSteps([...processSteps, { title: '', duration: '', tags: '' }]);
    smoothScrollToElement(`process-step-${nextIdx}`);
  };

  const removeProcessStep = (index) => {
    setProcessSteps(processSteps.filter((_, idx) => idx !== index));
  };

  const updateProcessStep = (index, field, val) => {
    const next = [...processSteps];
    next[index][field] = val;
    setProcessSteps(next);
  };

  const addDesktopFeature = () => {
    const nextIdx = desktopFeatures.length;
    setDesktopFeatures([...desktopFeatures, { title: '', text: '', image: '' }]);
    smoothScrollToElement(`desktop-feature-${nextIdx}`);
  };

  const removeDesktopFeature = (index) => {
    setDesktopFeatures(desktopFeatures.filter((_, idx) => idx !== index));
  };

  const updateDesktopFeature = (index, field, val) => {
    const next = [...desktopFeatures];
    next[index][field] = val;
    setDesktopFeatures(next);
  };

  const addMobileFeature = () => {
    const nextIdx = mobileFeatures.length;
    setMobileFeatures([...mobileFeatures, { title: '', label: '', image: '' }]);
    smoothScrollToElement(`mobile-feature-${nextIdx}`);
  };

  const removeMobileFeature = (index) => {
    setMobileFeatures(mobileFeatures.filter((_, idx) => idx !== index));
  };

  const updateMobileFeature = (index, field, val) => {
    const next = [...mobileFeatures];
    next[index][field] = val;
    setMobileFeatures(next);
  };

  const addPanoramaImage = () => {
    const nextIdx = panorama.length;
    setPanorama([...panorama, '']);
    smoothScrollToElement(`panorama-image-${nextIdx}`);
  };

  const removePanoramaImage = (index) => {
    setPanorama(panorama.filter((_, idx) => idx !== index));
  };

  const updatePanoramaImage = (index, val) => {
    const next = [...panorama];
    next[index] = val;
    setPanorama(next);
  };

  const addCustomBlock = () => {
    const nextIdx = customBlocks.length;
    setCustomBlocks([...customBlocks, { type: 'text', content: '' }]);
    smoothScrollToElement(`custom-block-${nextIdx}`);
  };

  const removeCustomBlock = (index) => {
    setCustomBlocks(customBlocks.filter((_, idx) => idx !== index));
  };

  const updateCustomBlock = (index, field, val) => {
    const next = [...customBlocks];
    next[index][field] = val;
    setCustomBlocks(next);
  };

  // --- Other Projects CRUD Operations ---
  const resetOtherForm = () => {
    setEditingOtherId(null);
    setOtherNum('');
    setOtherTitle('');
    setOtherDescription('');
    setOtherLinkUrl('');
  };

  const handleStartEditOther = (proj) => {
    setEditingOtherId(proj.id);
    setOtherNum(proj.num || '');
    setOtherTitle(proj.title || '');
    setOtherDescription(proj.description || '');
    setOtherLinkUrl(proj.link_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublishOtherProject = async (e) => {
    e.preventDefault();
    if (!otherNum || !otherTitle || !otherDescription) {
      setToast({ show: true, message: 'Пожалуйста, заполните Номер, Название и\u00a0Описание', type: 'error' });
      return;
    }

    setSavingOther(true);
    try {
      const payload = {
        num: otherNum,
        title: otherTitle,
        description: otherDescription,
        link_url: otherLinkUrl || null
      };

      if (editingOtherId) {
        // Update existing project
        const { error } = await supabase
          .from('other_projects')
          .update(payload)
          .eq('id', editingOtherId);
        if (error) throw error;
        setToast({ show: true, message: 'Проект успешно сохранен!', type: 'success' });
      } else {
        // Insert new project
        let nextSort = 0;
        if (otherProjects.length > 0) {
          const orders = otherProjects.map(p => p.sort_order).filter(o => o !== null && o !== undefined);
          if (orders.length > 0) {
            nextSort = Math.max(...orders) + 1;
          }
        }
        payload.sort_order = nextSort;

        const { error } = await supabase
          .from('other_projects')
          .insert([payload]);
        if (error) throw error;
        setToast({ show: true, message: 'Проект успешно добавлен в\u00a0базу!', type: 'success' });
      }
      resetOtherForm();
      fetchOtherProjects();
    } catch (err) {
      console.error('Error saving other project:', err);
      setToast({ show: true, message: 'Ошибка при\u00a0сохранении: ' + err.message, type: 'error' });
    } finally {
      setSavingOther(false);
    }
  };

  const handleDeleteOtherProject = async (id) => {
    try {
      const { error } = await supabase
        .from('other_projects')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setToast({ show: true, message: 'Проект успешно удален из\u00a0базы!', type: 'success' });
      if (editingOtherId === id) {
        resetOtherForm();
      }
      fetchOtherProjects();
    } catch (err) {
      console.error('Error deleting other project:', err);
      setToast({ show: true, message: 'Ошибка при\u00a0удалении: ' + err.message, type: 'error' });
    }
  };

  const handleMoveOtherProject = async (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= otherProjects.length) return;

    const currentItem = otherProjects[index];
    const targetItem = otherProjects[targetIdx];

    try {
      const tempSort = currentItem.sort_order;
      
      const { error: err1 } = await supabase
        .from('other_projects')
        .update({ sort_order: targetItem.sort_order })
        .eq('id', currentItem.id);
      if (err1) throw err1;

      const { error: err2 } = await supabase
        .from('other_projects')
        .update({ sort_order: tempSort })
        .eq('id', targetItem.id);
      if (err2) throw err2;

      setToast({ show: true, message: 'Порядок успешно изменен!', type: 'success' });
      fetchOtherProjects();
    } catch (err) {
      console.error('Error changing order:', err);
      setToast({ show: true, message: 'Ошибка при\u00a0перемещении: ' + err.message, type: 'error' });
    }
  };

  // Reset form states
  const resetForm = () => {
    setEditingId(null);
    setSlug('');
    setIsInDevelopment(false);
    setTitle('');
    setSubtitle('');
    setHeroImage('');
    setCardTitle('');
    setCardImage('');
    setCardTags('');
    setSphere('');
    setType('');
    setStack('');
    setYear(new Date().getFullYear().toString());
    setShortBio('');
    setTask('');
    setSolution('');
    setLiveUrl('');
    setProcessSteps([]);
    setDesktopFeatures([]);
    setMobileFeatures([]);
    setPanorama([]);
    setOutroImages([]);
    setCustomBlocks([]);
    setVisibility({
      process: true,
      challenge: true,
      desktop: true,
      mobile: true,
      panorama: true,
      outro: true,
      custom: true
    });
  };

  // Publish / Save Handler
  const handlePublishCase = async (e) => {
    e.preventDefault();
    if (!slug) {
      setToast({ show: true, message: 'Пожалуйста, укажите URL-адрес кейса (slug)', type: 'error' });
      return;
    }

    setPublishing(true);
    try {
      // Structure steps tags from string to array of strings
      const formattedProcessSteps = processSteps.map(step => ({
        ...step,
        tags: step.tags ? step.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      }));

      // Split card tags by comma
      const formattedCardTags = cardTags ? cardTags.split(',').map(t => t.trim()).filter(Boolean) : [];

      const payload = {
        slug,
        is_in_development: isInDevelopment,
        title,
        subtitle,
        heroImage,
        card_title: cardTitle,
        card_image: cardImage,
        card_tags: formattedCardTags,
        meta: {
          sphere,
          type,
          stack,
          year
        },
        about: {
          title: 'О\u00a0проекте',
          text: shortBio
        },
        challenge: {
          task,
          solution,
          liveUrl
        },
        visibility,
        process: formattedProcessSteps,
        features: desktopFeatures,
        mobile_features: mobileFeatures,
        panorama_images: panorama,
        outro: {
          images: outroImages,
          image: outroImages[0] || ''
        },
        custom_blocks: customBlocks
      };

      if (editingId) {
        // Edit mode: Update record
        const { error } = await supabase
          .from('cases')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
        setToast({ show: true, message: 'Изменения успешно сохранены!', type: 'success' });
      } else {
        // Creation mode: Calculate sort_order (min - 1)
        let calculatedSortOrder = 0;
        if (casesList.length > 0) {
          const orders = casesList.map(c => c.sort_order).filter(o => o !== null && o !== undefined);
          if (orders.length > 0) {
            calculatedSortOrder = Math.min(...orders) - 1;
          }
        }
        
        payload.sort_order = calculatedSortOrder;

        const { error } = await supabase
          .from('cases')
          .insert([payload]);

        if (error) throw error;
        setToast({ show: true, message: 'Кейс успешно опубликован!', type: 'success' });
      }

      resetForm();
      fetchCases();
    } catch (err) {
      console.error('Saving error:', err);
      setToast({ show: true, message: 'Ошибка при\u00a0сохранении кейса: ' + err.message, type: 'error' });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white text-zinc-900 font-sans antialiased">
      
      {/* LEFT COLUMN: Project List (Narrow sidebar) */}
      <aside className="w-full lg:w-96 border-r border-zinc-200 bg-white p-6 shrink-0">
        <div className="sticky top-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-black hover:underline mb-8 no-underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Вернуться на сайт</span>
          </Link>

          <h2 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23] mb-4">
            {activeTab === 'cases' ? '[ Управление кейсами ]' : '[ Управление другими проектами ]'}
          </h2>

          <div className="border-t border-zinc-100 my-4" />

          {activeTab === 'cases' ? (
            editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-zinc-200 rounded-sm text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer mb-4"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Создать новый кейс</span>
              </button>
            )
          ) : (
            editingOtherId !== null && (
              <button
                type="button"
                onClick={resetOtherForm}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-zinc-200 rounded-sm text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer mb-4"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Создать новый проект</span>
              </button>
            )
          )}

          {activeTab === 'cases' ? (
            loadingList ? (
              <div className="flex items-center gap-2 py-4 text-xs text-neutral-450">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF5B23]" />
                <span>Загрузка кейсов...</span>
              </div>
            ) : casesList.length === 0 ? (
              <p className="text-xs text-zinc-400 italic py-4">Список кейсов пуст</p>
            ) : (
              <ul className="space-y-2 pl-0 list-none my-0">
                {casesList.map((item, index) => {
                  const caseNumber = String(index + 1).padStart(2, '0');
                  return (
                    <li
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-start justify-between gap-3 p-3 border rounded-sm transition-all cursor-grab active:cursor-grabbing ${
                        draggedIndex === index ? 'opacity-40 border-dashed border-zinc-400 bg-zinc-50' :
                        editingId === item.id ? 'border-black bg-zinc-50' : 'border-zinc-100 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex gap-2.5 min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-[#FF5B23] select-none shrink-0 mt-[1px]">
                          {caseNumber}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold text-black break-words whitespace-normal leading-normal">
                            {item.title || item.card_title || '(Без\u00a0названия)'}
                          </span>
                          <span className="block text-[10px] text-zinc-400 truncate mt-0.5">
                            /{item.slug}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 mt-[1px]">
                        <div className="flex items-center gap-0.5 border border-zinc-100 rounded-sm p-[2px] bg-zinc-50/50">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveCase(index, 'up')}
                            className="w-6 h-6 flex items-center justify-center rounded-sm transition-colors text-[10px] text-zinc-400 hover:bg-white hover:text-neutral-700 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-zinc-400 cursor-pointer p-0"
                            title="Переместить вверх"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={index === casesList.length - 1}
                            onClick={() => handleMoveCase(index, 'down')}
                            className="w-6 h-6 flex items-center justify-center rounded-sm transition-colors text-[10px] text-zinc-400 hover:bg-white hover:text-neutral-700 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-zinc-400 cursor-pointer p-0"
                            title="Переместить вниз"
                          >
                            ▼
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-sm transition-colors text-zinc-400 hover:bg-neutral-100 hover:text-neutral-700 cursor-pointer p-0"
                          title="Редактировать"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-sm transition-colors text-zinc-400 hover:bg-red-50 hover:text-red-650 cursor-pointer p-0"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )
          ) : (
            loadingOther ? (
              <div className="flex items-center gap-2 py-4 text-xs text-neutral-450">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF5B23]" />
                <span>Загрузка проектов...</span>
              </div>
            ) : otherProjects.length === 0 ? (
              <p className="text-xs text-zinc-400 italic py-4">Список проектов пуст</p>
            ) : (
              <ul className="space-y-2 pl-0 list-none my-0">
                {otherProjects.map((item, index) => {
                  const projNumber = String(index + 1).padStart(2, '0');
                  return (
                    <li
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-start justify-between gap-3 p-3 border rounded-sm transition-all cursor-grab active:cursor-grabbing ${
                        draggedIndex === index ? 'opacity-40 border-dashed border-zinc-400 bg-zinc-50' :
                        editingOtherId === item.id ? 'border-black bg-zinc-50' : 'border-zinc-100 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex gap-2.5 min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-[#FF5B23] select-none shrink-0 mt-[1px]">
                          {projNumber}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold text-black break-words whitespace-normal leading-normal">
                            {item.title || '(Без\u00a0названия)'}
                          </span>
                          <span className="block text-[10px] text-zinc-400 truncate mt-0.5">
                            № {item.num}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 mt-[1px]">
                        <div className="flex items-center gap-0.5 border border-zinc-100 rounded-sm p-[2px] bg-zinc-50/50">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveOtherProject(index, 'up')}
                            className="w-6 h-6 flex items-center justify-center rounded-sm transition-colors text-[10px] text-zinc-400 hover:bg-white hover:text-neutral-700 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-zinc-400 cursor-pointer p-0"
                            title="Переместить вверх"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={index === otherProjects.length - 1}
                            onClick={() => handleMoveOtherProject(index, 'down')}
                            className="w-6 h-6 flex items-center justify-center rounded-sm transition-colors text-[10px] text-zinc-400 hover:bg-white hover:text-neutral-700 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-zinc-400 cursor-pointer p-0"
                            title="Переместить вниз"
                          >
                            ▼
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleStartEditOther(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-sm transition-colors text-zinc-400 hover:bg-neutral-100 hover:text-neutral-700 cursor-pointer p-0"
                          title="Редактировать"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setOtherProjToDelete(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-sm transition-colors text-zinc-400 hover:bg-red-50 hover:text-red-650 cursor-pointer p-0"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )
          )}
        </div>
      </aside>

      {/* RIGHT COLUMN: Form Constructor (Wide workspace) */}
      <main className="flex-1 p-6 md:p-12 lg:p-16 max-w-4xl bg-white">
        {/* Tab switcher tabs bar */}
        <div className="flex border-b\u00a0border-zinc-200 mb-8">
          <button
            type="button"
            onClick={() => {
              setActiveTab('cases');
              resetForm();
            }}
            className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'cases'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-zinc-400 hover:text-black font-semibold'
            }`}
          >
            Кейсы
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('other');
              resetOtherForm();
            }}
            className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'other'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-zinc-400 hover:text-black font-semibold'
            }`}
          >
            Другие проекты
          </button>
        </div>

        {activeTab === 'cases' ? (
          <>
            {/* Toggle Mode header action */}
            {editingId !== null && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-sm cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>[+] Создать новый кейс</span>
                </button>
              </div>
            )}

            <h1 className="text-3xl font-light tracking-tighter text-black mb-8">
              {editingId !== null ? `Редактирование кейса: ${slug}` : '+ Добавить новый кейс'}
            </h1>

            <form onSubmit={handlePublishCase} className="space-y-12">
              
              {/* SECTION 1: BASIC INFORMATION */}
              <section className="space-y-6 bg-white p-6 border border-zinc-150 rounded-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23] border-b\u00a0border-zinc-100 pb-2">
                  [ 1. Основные параметры Hero ]
                </h3>

                {/* PREVIEW CARD FIELDS */}
                <div className="bg-zinc-50/40 p-4 border border-zinc-200 rounded-sm space-y-4">
                  <span className="block text-[10px] font-bold text-[#FF5B23] uppercase tracking-wider">
                    Превью карточки для главной страницы
                  </span>

                  {/* In Development Checkbox */}
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="is-in-development"
                      checked={isInDevelopment}
                      onChange={(e) => setIsInDevelopment(e.target.checked)}
                      className="w-4 h-4 accent-black rounded-[2px]"
                    />
                    <label htmlFor="is-in-development" className="text-xs font-semibold uppercase tracking-wider text-zinc-800 cursor-pointer select-none">
                      Кейс находится в разработке (is_in_development)
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                        Заголовок на превью
                      </label>
                      <input
                        type="text"
                        placeholder="Одежда FORME"
                        value={cardTitle}
                        onChange={(e) => setCardTitle(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors"
                      />
                      <span className="block text-[11px] text-zinc-400 mt-1">
                        Краткое название карточки
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                        Теги карточки
                      </label>
                      <input
                        type="text"
                        placeholder="E-commerce, UX/UI, Web Design"
                        value={cardTags}
                        onChange={(e) => setCardTags(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors"
                      />
                      <span className="block text-[11px] text-zinc-400 mt-1">
                        Через запятую
                      </span>
                    </div>
                  </div>

                  <ImageUpload
                    label="Изображение карточки"
                    value={cardImage}
                    onChange={setCardImage}
                    onError={(msg) => setToast({ show: true, message: msg, type: 'error' })}
                    pathPrefix={`${slug}-card`}
                  />
                </div>

                <div className="border-t border-zinc-100 my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                      URL-адрес (Slug)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="forme-shop"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors font-mono"
                    />
                    <span className="block text-[11px] text-zinc-400 mt-1">
                      Только латиница, цифры, дефисы. Пример: dynamic-case
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                      Главный заголовок кейса (Title)
                    </label>
                    <input
                      type="text"
                      placeholder="Интернет-магазин FORME"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors"
                    />
                    <span className="block text-[11px] text-zinc-400 mt-1">
                      Отображается на обложке кейса
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                      Подзаголовок кейса (Subtitle)
                    </label>
                    <input
                      type="text"
                      placeholder="Сайт с\u00a0акцентом на\u00a0чистые силуэты и\u00a0форму..."
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors"
                    />
                    <span className="block text-[11px] text-zinc-400 mt-1">
                      Краткое введение под главным заголовком
                    </span>
                  </div>
                </div>

                <ImageUpload
                  label="Главное изображение обложки (Hero)"
                  value={heroImage}
                  onChange={setHeroImage}
                  onError={(msg) => setToast({ show: true, message: msg, type: 'error' })}
                  pathPrefix={`${slug}-hero`}
                />
              </section>

              <hr className="border-neutral-200 my-8" />

              {/* SECTION 2: METADATA & ABOUT */}
              <section className="space-y-6 bg-neutral-50 p-6 border border-zinc-200/60 rounded-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23] border-b\u00a0border-zinc-200 pb-2">
                  [ 2. Мета-данные и Описание ]
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                      Сфера
                    </label>
                    <input
                      type="text"
                      placeholder="E-commerce"
                      value={sphere}
                      onChange={(e) => setSphere(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors"
                    />
                    <span className="block text-[11px] text-zinc-400 mt-1">
                      Например: Ритейл
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                      Тип проекта
                    </label>
                    <input
                      type="text"
                      placeholder="Интернет-магазин"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors"
                    />
                    <span className="block text-[11px] text-zinc-400 mt-1">
                      Например: Лендинг
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                      Стек
                    </label>
                    <input
                      type="text"
                      placeholder="UX/UI, React, Next.js"
                      value={stack}
                      onChange={(e) => setStack(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors"
                    />
                    <span className="block text-[11px] text-zinc-400 mt-1">
                      Через запятую
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                      Год
                    </label>
                    <input
                      type="text"
                      placeholder="2025"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors"
                    />
                    <span className="block text-[11px] text-zinc-400 mt-1">
                      4 цифры года
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                    Краткое описание параграфа
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Расскажите в\u00a03-5 предложениях о\u00a0целях, задачах и\u00a0сути проекта..."
                    value={shortBio}
                    onChange={(e) => setShortBio(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors resize-y"
                  />
                  <span className="block text-[11px] text-zinc-400 mt-1">
                    Выводится в блоке «О проекте»
                  </span>
                </div>
              </section>

              <hr className="border-neutral-200 my-8" />

              {/* SECTION 3: TASK & SOLUTION */}
              <section className="space-y-6 bg-white p-6 border border-zinc-150 rounded-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23] border-b\u00a0border-zinc-100 pb-2">
                  [ 3. Задача и Решение ]
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                      Задача проекта (Task)
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Опишите техническую сложность или\u00a0бизнес-задачу..."
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors resize-y"
                    />
                    <span className="block text-[11px] text-zinc-400 mt-1">
                      Что нужно было сделать
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                      Решение (Solution)
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Опишите спроектированный путь решения проблемы..."
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors resize-y"
                    />
                    <span className="block text-[11px] text-zinc-400 mt-1">
                      Как была решена задача
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                    Ссылка на живой сайт
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black focus:ring-0 outline-none transition-colors"
                  />
                  <span className="block text-[11px] text-zinc-400 mt-1">
                    Если оставить пустым, кнопка View Experience автоматически скроется на сайте
                  </span>
                </div>
              </section>

              <hr className="border-neutral-200 my-8" />

              {/* SECTION 4: VISIBILITY TOGGLES */}
              <section className="space-y-6 bg-neutral-50 p-6 border border-zinc-200/60 rounded-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23] border-b\u00a0border-zinc-200 pb-2">
                  [ 4. Видимость блоков на сайте ]
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.keys(visibility).map((key) => {
                    const labels = {
                      process: (
                        <>
                          Показывать блок 'Процесс работы' <span className="text-zinc-400 font-normal">(№5)</span>
                        </>
                      ),
                      challenge: (
                        <>
                          Показывать блок 'Задача и\u00a0Решение' <span className="text-zinc-400 font-normal">(№3)</span>
                        </>
                      ),
                      desktop: (
                        <>
                          Показывать блок 'Десктопные фичи' <span className="text-zinc-400 font-normal">(№7)</span>
                        </>
                      ),
                      mobile: (
                        <>
                          Показывать блок 'Мобильная версия' <span className="text-zinc-400 font-normal">(№8)</span>
                        </>
                      ),
                      panorama: (
                        <>
                          Показывать блок 'Панорамный шоукейс' <span className="text-zinc-400 font-normal">(№6)</span>
                        </>
                      ),
                      outro: (
                        <>
                          Показывать блок 'Финальный шоукейс' <span className="text-zinc-400 font-normal">(№9)</span>
                        </>
                      ),
                      custom: (
                        <>
                          Показывать блок 'Инфо/Кастом' <span className="text-zinc-400 font-normal">(№10)</span>
                        </>
                      )
                    };

                    return (
                      <div key={key} className="flex items-center gap-2 border border-zinc-200 bg-white p-2.5 rounded-sm">
                        <input
                          type="checkbox"
                          id={`visible-${key}`}
                          checked={visibility[key]}
                          onChange={(e) => setVisibility({ ...visibility, [key]: e.target.checked })}
                          className="w-4 h-4 accent-black rounded-[2px]"
                        />
                        <label htmlFor={`visible-${key}`} className="text-[11px] font-semibold text-zinc-800 cursor-pointer select-none">
                          {labels[key] || key}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </section>

              <hr className="border-neutral-200 my-8" />

              {/* SECTION 5: PROCESS STEPS */}
              <section className="space-y-6 bg-white p-6 border border-zinc-150 rounded-sm">
                <div className="flex items-center justify-between border-b\u00a0border-zinc-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23]">
                    [ 5. Конструктор процесса реализации ]
                  </h3>
                  <button
                    type="button"
                    onClick={addProcessStep}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-black hover:underline cursor-pointer border border-zinc-200 px-2 py-1 rounded-[2px] bg-white transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Добавить этап</span>
                  </button>
                </div>

                {processSteps.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Этапы процесса не добавлены. Будут использоваться заглушки.</p>
                ) : (
                  <div className="space-y-4">
                    {processSteps.map((step, idx) => (
                      <div key={idx} id={`process-step-${idx}`} className="p-4 border border-zinc-200 rounded-sm space-y-3 relative bg-zinc-50/10">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-zinc-400">Этап {idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeProcessStep(idx)}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Удалить</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                              Название этапа
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Анализ и\u00a0стратегия"
                              value={step.title}
                              onChange={(e) => updateProcessStep(idx, 'title', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-sm focus:border-black outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                              Срок выполнения
                            </label>
                            <input
                              type="text"
                              placeholder="2-3 дня / 1 неделя"
                              value={step.duration}
                              onChange={(e) => updateProcessStep(idx, 'duration', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-sm focus:border-black outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                            Краткое описание / детализация
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Например: Сбор требований, анализ конкурентов, проектирование..."
                            value={step.description || ''}
                            onChange={(e) => updateProcessStep(idx, 'description', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-sm focus:border-black outline-none resize-y"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                            Теги этапа (через запятую)
                          </label>
                          <input
                            type="text"
                            placeholder="Исследования, Аналитика, CJM"
                            value={step.tags || ''}
                            onChange={(e) => updateProcessStep(idx, 'tags', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-sm focus:border-black outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <hr className="border-neutral-200 my-8" />

              {/* SECTION 6: DESKTOP FEATURES */}
              <section className="space-y-6 bg-neutral-50 p-6 border border-zinc-200/60 rounded-sm">
                <div className="flex items-center justify-between border-b\u00a0border-zinc-200 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23]">
                    [ 6. Ключевые функции (Desktop) ]
                  </h3>
                  <button
                    type="button"
                    onClick={addDesktopFeature}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-black hover:underline cursor-pointer border border-zinc-200 px-2 py-1 rounded-[2px] bg-white transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Добавить фичу</span>
                  </button>
                </div>

                {desktopFeatures.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Функции десктопа не добавлены.</p>
                ) : (
                  <div className="space-y-6">
                    {desktopFeatures.map((card, idx) => (
                      <div key={idx} id={`desktop-feature-${idx}`} className="p-4 border border-zinc-200 rounded-sm bg-white space-y-4 relative">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-zinc-400">Десктопная функция #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeDesktopFeature(idx)}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Удалить</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                              Название функции
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Онлайн-запись к\u00a0врачу"
                              value={card.title}
                              onChange={(e) => updateDesktopFeature(idx, 'title', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-sm focus:border-black outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                              Описание функции
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Опишите, что делает эта десктопная функция..."
                              value={card.text}
                              onChange={(e) => updateDesktopFeature(idx, 'text', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-sm focus:border-black outline-none resize-y"
                            />
                          </div>
                        </div>

                        <ImageUpload
                          label="Изображение десктопной функции"
                          value={card.image}
                          onChange={(url) => updateDesktopFeature(idx, 'image', url)}
                          onError={(msg) => setToast({ show: true, message: msg, type: 'error' })}
                          pathPrefix={`${slug}-d-feat-${idx}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <hr className="border-neutral-200 my-8" />

              {/* SECTION 7: MOBILE FEATURES */}
              <section className="space-y-6 bg-white p-6 border border-zinc-150 rounded-sm">
                <div className="flex items-center justify-between border-b\u00a0border-zinc-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23]">
                    [ 7. Ключевые функции (Mobile) ]
                  </h3>
                  <button
                    type="button"
                    onClick={addMobileFeature}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-black hover:underline cursor-pointer border border-zinc-200 px-2 py-1 rounded-[2px] bg-white transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Добавить мобильную фичу</span>
                  </button>
                </div>

                {mobileFeatures.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Мобильные функции не добавлены.</p>
                ) : (
                  <div className="space-y-6">
                    {mobileFeatures.map((card, idx) => (
                      <div key={idx} id={`mobile-feature-${idx}`} className="p-4 border border-zinc-200 rounded-sm bg-zinc-50/10 space-y-4 relative">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-zinc-400">Мобильная функция #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeMobileFeature(idx)}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Удалить</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                              Название функции
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Телемед чат"
                              value={card.title}
                              onChange={(e) => updateMobileFeature(idx, 'title', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-sm focus:border-black outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                              Лейбл/Категория (например, Консультация)
                            </label>
                            <input
                              type="text"
                              placeholder="Консультация"
                              value={card.label}
                              onChange={(e) => updateMobileFeature(idx, 'label', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-sm focus:border-black outline-none"
                            />
                          </div>
                        </div>

                        <ImageUpload
                          label="Изображение мобильной фичи"
                          value={card.image}
                          onChange={(url) => updateMobileFeature(idx, 'image', url)}
                          onError={(msg) => setToast({ show: true, message: msg, type: 'error' })}
                          pathPrefix={`${slug}-m-feat-${idx}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <hr className="border-neutral-200 my-8" />

              {/* SECTION 8: PANORAMA IMAGES */}
              <section className="space-y-6 bg-neutral-50 p-6 border border-zinc-200/60 rounded-sm">
                <div className="flex items-center justify-between border-b\u00a0border-zinc-200 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23]">
                    [ 8. Панорамный шоукейс ]
                  </h3>
                  <button
                    type="button"
                    onClick={addPanoramaImage}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-black hover:underline cursor-pointer border border-zinc-200 px-2 py-1 rounded-[2px] bg-white transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Добавить изображение</span>
                  </button>
                </div>

                {panorama.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Панорамные изображения не добавлены.</p>
                ) : (
                  <div className="space-y-4">
                    {panorama.map((imgUrl, idx) => (
                      <div key={idx} id={`panorama-image-${idx}`} className="p-4 border border-zinc-200 rounded-sm bg-white space-y-2 relative">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-zinc-400">Изображение #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removePanoramaImage(idx)}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Удалить</span>
                          </button>
                        </div>

                        <ImageUpload
                          label="Загрузить изображение"
                          value={imgUrl}
                          onChange={(url) => updatePanoramaImage(idx, url)}
                          onError={(msg) => setToast({ show: true, message: msg, type: 'error' })}
                          pathPrefix={`${slug}-pan-${idx}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <hr className="border-neutral-200 my-8" />

              {/* SECTION 9: OUTRO IMAGES */}
              <section className="space-y-6 bg-white p-6 border border-zinc-150 rounded-sm">
                <div className="flex items-center justify-between border-b\u00a0border-zinc-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23]">
                    [ 9. Финальный шоукейс (Outro) ]
                  </h3>
                  <button
                    type="button"
                    onClick={() => setOutroImages([...outroImages, ''])}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-black hover:underline cursor-pointer border border-zinc-200 px-2 py-1 rounded-[2px] bg-white transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Добавить изображение</span>
                  </button>
                </div>

                {outroImages.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Финальные изображения не добавлены.</p>
                ) : (
                  <div className="space-y-4">
                    {outroImages.map((imgUrl, idx) => (
                      <div key={idx} className="p-4 border border-zinc-200 rounded-sm bg-zinc-50/10 space-y-2 relative">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-zinc-400">Финальное изображение #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => setOutroImages(outroImages.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Удалить</span>
                          </button>
                        </div>

                        <ImageUpload
                          label="Загрузить изображение"
                          value={imgUrl}
                          onChange={(url) => {
                            const next = [...outroImages];
                            next[idx] = url;
                            setOutroImages(next);
                          }}
                          onError={(msg) => setToast({ show: true, message: msg, type: 'error' })}
                          pathPrefix={`${slug}-outro-${idx}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <hr className="border-neutral-200 my-8" />

              {/* SECTION 10: CUSTOM BLOCKS */}
              <section className="space-y-6 bg-neutral-50 p-6 border border-zinc-200/60 rounded-sm">
                <div className="flex items-center justify-between border-b\u00a0border-zinc-200 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23]">
                    [ 10. Кастомные инфо-блоки ]
                  </h3>
                  <button
                    type="button"
                    onClick={addCustomBlock}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-black hover:underline cursor-pointer border border-zinc-200 px-2 py-1 rounded-[2px] bg-white transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Добавить блок</span>
                  </button>
                </div>

                {customBlocks.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Кастомные блоки не добавлены.</p>
                ) : (
                  <div className="space-y-6">
                    {customBlocks.map((block, idx) => (
                      <div key={idx} id={`custom-block-${idx}`} className="p-5 border border-zinc-200 rounded-sm relative bg-white space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-400">Блок #{idx + 1}</span>
                            <select
                              value={block.type}
                              onChange={(e) => updateCustomBlock(idx, 'type', e.target.value)}
                              className="px-2 py-1 text-xs bg-white border border-zinc-200 rounded-[2px] outline-none"
                            >
                              <option value="text">Текст</option>
                              <option value="image">Картинка</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCustomBlock(idx)}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Удалить</span>
                          </button>
                        </div>

                        {block.type === 'text' ? (
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                              Кастомный текст
                            </label>
                            <textarea
                              rows={4}
                              placeholder="Введите кастомный текст..."
                              value={block.content}
                              onChange={(e) => updateCustomBlock(idx, 'content', e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-sm focus:border-black outline-none"
                            />
                          </div>
                        ) : (
                            <ImageUpload
                              label="Кастомное изображение"
                              value={block.content}
                              onChange={(url) => updateCustomBlock(idx, 'content', url)}
                              onError={(msg) => setToast({ show: true, message: msg, type: 'error' })}
                              pathPrefix={`${slug}-custom-${idx}`}
                            />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* PUBLISH ACTION */}
              <div className="pt-6 border-t border-zinc-200 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={publishing}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-black text-white hover:bg-neutral-800 rounded-sm text-sm font-semibold transition-colors disabled:bg-zinc-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  {publishing && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{publishing ? 'Сохранение...' : (editingId !== null ? 'Сохранить изменения' : 'Опубликовать новый кейс')}</span>
                </button>
              </div>

            </form>
          </>
        ) : (
          <>
            {/* TAB 2: OTHER PROJECTS SINGLE FORM */}
            {editingOtherId !== null && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={resetOtherForm}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-sm cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>[+] Создать новый проект</span>
                </button>
              </div>
            )}

            <h1 className="text-3xl font-light tracking-tighter text-black mb-8">
              {editingOtherId !== null ? `Редактирование проекта: ${otherTitle}` : '+ Добавить новый проект в\u00a0архив'}
            </h1>

            <form onSubmit={handlePublishOtherProject} className="space-y-6 bg-white p-6 border border-zinc-150 rounded-sm max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                    Номер
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="01"
                    maxLength={4}
                    value={otherNum}
                    onChange={(e) => setOtherNum(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black outline-none font-mono"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                    Название проекта
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Интернет-магазин FORME"
                    value={otherTitle}
                    onChange={(e) => setOtherTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                  Ссылка (необязательно)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={otherLinkUrl}
                  onChange={(e) => setOtherLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                  Описание проекта
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Опишите проект, его суть и\u00a0технологическую направленность..."
                  value={otherDescription}
                  onChange={(e) => setOtherDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-sm focus:border-black outline-none resize-y"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100">
                {editingOtherId !== null && (
                  <button
                    type="button"
                    onClick={resetOtherForm}
                    className="px-4 py-2 border border-zinc-200 hover:border-black rounded-sm text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer bg-white text-zinc-700"
                  >
                    Отмена
                  </button>
                )}
                <button
                  type="submit"
                  disabled={savingOther}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-black text-white hover:bg-neutral-800 rounded-sm text-xs font-bold tracking-wider uppercase transition-colors disabled:bg-zinc-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  {savingOther && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{savingOther ? 'Сохранение...' : (editingOtherId !== null ? 'Сохранить изменения' : 'Добавить проект')}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </main>
{/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 text-xs font-semibold tracking-wider uppercase px-4 py-3 border rounded-sm shadow-xl flex items-center gap-2 transition-all duration-300 animate-toast ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-black text-white border-neutral-800'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete !== null && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white border border-neutral-200 rounded-sm p-6 max-w-sm w-full shadow-2xl animate-toast">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23] mb-3">
              [ Подтверждение удаления ]
            </h4>
            <p className="text-xs text-zinc-800 font-medium leading-relaxed mb-6">
              Вы уверены, что хотите полностью удалить кейс "{itemToDelete.title || itemToDelete.card_title || itemToDelete.slug}"?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 border border-zinc-200 hover:border-black rounded-sm text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer bg-white text-zinc-700"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteCase(itemToDelete.id, itemToDelete.slug);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-sm text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Other Project Confirmation Modal */}
      {otherProjToDelete !== null && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white border border-neutral-200 rounded-sm p-6 max-w-sm w-full shadow-2xl animate-toast">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#FF5B23] mb-3">
              [ Подтверждение удаления ]
            </h4>
            <p className="text-xs text-zinc-800 font-medium leading-relaxed mb-6">
              Вы уверены, что хотите удалить проект "{otherProjToDelete.title || otherProjToDelete.num}"?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOtherProjToDelete(null)}
                className="px-4 py-2 border border-zinc-200 hover:border-black rounded-sm text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer bg-white text-zinc-700"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteOtherProject(otherProjToDelete.id, !!otherProjToDelete.isTemp);
                  setOtherProjToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-sm text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes toastFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-toast {
          animation: toastFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

    </div>
  );
}
