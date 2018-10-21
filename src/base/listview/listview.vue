<template>
  <scroll :data="data"
          class="listview"
          ref="listview"
          :probeType="probeType"
          :listenScroll="listenScroll"
          @scroll="scrollHandle">

    <ul>
      <li v-for="group in data"
          class="list-group"
          ref="listGroup"
          :key="group.title">
        <h2 class="list-group-title">{{group.title}}</h2>
        <uL>
          <li @click="selectItem(item)"
              v-for="item in group.items"
              class="list-group-item"
              :key="item.name">
            <img class="avatar"
                 v-lazy="item.avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </uL>
      </li>
    </ul>

    <div class="list-shortcut"
         @touchstart="onShortcutTouchStart"
         @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li v-for="(item, index) in shortcutList"
            :key="item"
            :data-index="index"
            :class="currentIndex === index ? 'current' : ''"
            class="item">{{item}}</li>
      </ul>
    </div>

    <div class="list-fixed"
         v-show="fixedTitle"
         ref="fixed">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>

    <div v-show="!data.length"
         class="loading-container">
      <loading></loading>
    </div>

  </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import {getData} from 'common/js/dom'

const TITLE_HEIGHT = 30
const ANCHOR_HEIGHT = 18

export default {
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  components: {
    Scroll,
    Loading
  },
  data() {
    return {
      scrollY: -1, // 左侧歌手列表滚动位置
      currentIndex: 0, // 左侧歌手列表当前滚动到的index
      diff: -1 // 用于比较顶部title隐藏时机
    }
  },
  computed: {
    shortcutList() {
      return this.data.map(group => group.title.substr(0, 1))
    },
    fixedTitle() {
      if (this.scrollY > 0) return ''
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  created() {
    // 没有在data函数里声明的变量，vue不会监控其变化，以下变量vue不会监听起变化
    this.touch = {} // 右侧导航条的移动端事件触点信息
    this.listenScroll = true // 是否监听左侧歌手列表滚动时better-scroll派发的滚动事件
    this.listHeight = [] // 每个group的递增高度
    this.probeType = 3
  },
  methods: {
    selectItem() {
    },
    onShortcutTouchStart(e) {
      let anchorIndex = getData(e.target, 'index')
      anchorIndex = parseInt(anchorIndex) // String to Number
      const firstTouch = e.touches[0]
      this.touch.y1 = firstTouch.pageY
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
    },
    onShortcutTouchMove(e) {
      const firstTouch = e.touches[0]
      this.touch.y2 = firstTouch.pageY
      const delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0 // | 0 与 Math.floor 相同都可以向下取整
      const anchorIndex = this.touch.anchorIndex + delta
      this._scrollTo(anchorIndex)
    },
    scrollHandle(pos) {
      this.scrollY = pos.y
    },
    _scrollTo(index) {
      if (!index && index !== 0) return
      if (index < 0) {
        index = 0
      } else if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2
      }
      this.scrollY = -this.listHeight[index]
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0) // 100ms 缓动时间
    },
    _calculateHeight() { // 计算每个group高度
      this.listHeight = []
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    }
  },
  watch: {
    data() {
      // 数据变化时dom还没渲染好
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    scrollY(newY) {
      const listHeight = this.listHeight
      // 当滚动到顶部(向下拖拽会有正值)
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      // 在中间部分滚动时
      for (let i = 0; i < listHeight.length - 1; i++) {
        let heightCurrnet = listHeight[i]
        let heightNext = listHeight[i + 1]
        if (!heightNext || (-newY >= heightCurrnet && -newY < heightNext)) {
          this.currentIndex = i
          this.diff = heightNext + newY // 即将到来的 group 的高度与已滚动的距离的差
          return
        }
      }
      // 当滚动到底部，且 -newY 大于最后一个元素的上限
      this.currentIndex = listHeight.length - 2
    },
    diff(newVal) {
      // console.log('>>>>ft: ', this.fixedTop)
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      if (this.fixedTop === fixedTop) return
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
    }
  }
}

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable'
.listview
  position: relative
  width: 100%
  height: 100%
  overflow: hidden
  background: $color-background
  .list-group
    padding-bottom: 30px
    .list-group-title
      height: 30px
      line-height: 30px
      padding-left: 20px
      font-size: $font-size-small
      color: $color-text-l
      background: $color-highlight-background
    .list-group-item
      display: flex
      align-items: center
      padding: 20px 0 0 30px
      .avatar
        width: 50px
        height: 50px
        border-radius: 50%
      .name
        margin-left: 20px
        color: $color-text-l
        font-size: $font-size-medium
  .list-shortcut
    position: absolute
    z-index: 30
    right: 0
    top: 50%
    transform: translateY(-50%)
    width: 20px
    padding: 20px 0
    border-radius: 10px
    text-align: center
    background: $color-background-d
    font-family: Helvetica
    .item
      padding: 3px
      line-height: 1
      color: $color-text-l
      font-size: $font-size-small
      &.current
        color: $color-theme
  .list-fixed
    position: absolute
    top: 0
    left: 0
    width: 100%
    .fixed-title
      height: 30px
      line-height: 30px
      padding-left: 20px
      font-size: $font-size-small
      color: $color-text-l
      background: $color-highlight-background
  .loading-container
    position: absolute
    width: 100%
    top: 50%
    transform: translateY(-50%)
</style>
