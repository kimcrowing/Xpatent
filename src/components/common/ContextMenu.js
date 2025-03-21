// 通用右键菜单组件

export default {
  name: 'ContextMenu',
  props: {
    menuItems: {
      type: Array,
      required: true
    },
    target: {
      type: HTMLElement,
      default: null
    }
  },
  data() {
    return {
      isVisible: false,
      x: 0,
      y: 0,
      selectedText: '',
      selectionRange: { start: 0, end: 0 }
    }
  },
  mounted() {
    if (this.target) {
      this.target.addEventListener('mouseup', this.checkSelection)
      this.target.addEventListener('keyup', this.checkSelection)
      this.target.addEventListener('contextmenu', this.showMenu)
    }
    
    document.addEventListener('click', this.hideMenu)
    document.addEventListener('keydown', this.handleKeyDown)
  },
  beforeDestroy() {
    if (this.target) {
      this.target.removeEventListener('mouseup', this.checkSelection)
      this.target.removeEventListener('keyup', this.checkSelection)
      this.target.removeEventListener('contextmenu', this.showMenu)
    }
    
    document.removeEventListener('click', this.hideMenu)
    document.removeEventListener('keydown', this.handleKeyDown)
  },
  methods: {
    checkSelection() {
      if (!this.target) return
      
      if (this.target.tagName === 'TEXTAREA' || this.target.tagName === 'INPUT') {
        const start = this.target.selectionStart
        const end = this.target.selectionEnd
        const text = this.target.value.substring(start, end).trim()
        
        this.selectedText = text
        this.selectionRange = { start, end }
      } else {
        const selection = window.getSelection()
        const text = selection.toString().trim()
        
        this.selectedText = text
        
        // 获取选区范围对于非输入元素较复杂，这里简化处理
        this.selectionRange = { 
          start: 0, 
          end: text.length,
          selection: selection
        }
      }
    },
    
    showMenu(e) {
      e.preventDefault()
      
      if (!this.selectedText) return
      
      this.isVisible = true
      this.x = e.clientX
      this.y = e.clientY
      
      // 确保菜单不超出屏幕
      this.$nextTick(() => {
        const menu = this.$refs.menu
        const menuRect = menu.getBoundingClientRect()
        
        if (this.x + menuRect.width > window.innerWidth) {
          this.x = window.innerWidth - menuRect.width - 5
        }
        
        if (this.y + menuRect.height > window.innerHeight) {
          this.y = window.innerHeight - menuRect.height - 5
        }
      })
    },
    
    hideMenu() {
      this.isVisible = false
    },
    
    handleKeyDown(e) {
      if (e.key === 'Escape') {
        this.hideMenu()
      }
    },
    
    handleItemClick(item) {
      if (item.action && typeof item.action === 'function') {
        item.action(this.selectedText, this.selectionRange)
      }
      
      this.hideMenu()
    }
  },
  template: `
    <div ref="menu" class="context-menu" v-show="isVisible" :style="{ top: y + 'px', left: x + 'px' }">
      <div 
        v-for="(item, index) in menuItems" 
        :key="index"
        class="menu-item"
        @click="handleItemClick(item)"
        v-if="!item.divider && !item.header">
        <i v-if="item.icon" :class="item.icon"></i>
        {{ item.label }}
      </div>
      <div v-else-if="item.divider" class="menu-divider"></div>
      <div v-else-if="item.header" class="menu-header">{{ item.label }}</div>
    </div>
  `
} 