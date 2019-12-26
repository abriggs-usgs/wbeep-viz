<template>
  <div id="subTitleContainer">
    <div id="subtitle">
      <div id="subtitleText">
        <p>Monitoring locations of the Delaware Basin</p>
      </div>
      <div id="subtitleInfoButton">
        <a
          id="subtitleIcon"
          v-ga="$ga.commands.trackName.bind(this, 'button-subtitle', 'click', 'user opened about text box')"
          href="javascript:void(0);"
          aria-label="more information link"
          class="icon"
          @click="$emit('clickedInfoIcon')"
        >
          <font-awesome-icon icon="info" />
        </a>
      </div>
    </div>
    <div id="data-date-div" />
    <SubtitleModal
      v-if="isAboutMapInfoBoxOpen"
      @clickedExit="$emit('clickedExit')"
    />
  </div>
</template>

<script>
import SubtitleModal from "./SubtitleModal";
export default {
  name: "MapSubtitle",
  components: {
    SubtitleModal
  },
  props: {
    isAboutMapInfoBoxOpen: {
      type: Boolean,
      required: true,
      default: true
    }
  }
};
</script>

<style scoped lang="scss">
#subTitleContainer {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  width: 70%;
  max-width: 260px;
}

#subtitle {
  background: rgb(255, 255, 255);
  background: rgba(255, 255, 255, 0.8);
  position: relative;
  border-radius: 5px;
  display: flex;
  text-align: center;
  border: 1px solid rgb(200, 200, 200);

  p {
    margin: 0;
    user-select: none;
    font-size: 0.75em;
  }

  #subtitleText {
    flex: 9;
    p {
      padding: 5px 5px;
    }
  }

  #subtitleInfoButton {
    border-left: 1px solid rgb(200, 200, 200);
    flex: 1;

    #subtitleIcon {
      display: inline-block;
      border-radius: 0 5px 5px 0;
      width: 100%;
      height: 100%;
      color: #000;
      outline: none;

      &:hover{
        color:#fff;
        background: #003366;
      }

      &:active {
        background: #003366;
        color: #ffffff;
      }

      svg {
        width: 18px;
        height: 18px;
        margin: 9px 0 0 0;
      }
    }
  }
}

@media screen and (min-width: 360px) {
  #subtitle {
    #subtitleText {
      line-height: 30px;
      p {
        padding: 0 5px;
      }
    }

    #subtitleInfoButton {
      #subtitleIcon {
        svg {
          margin: 5px 0 0 0;
        }
      }
    }
  }
}

@media screen and (min-width: 600px) {
  #subtitle {
    p {
      font-size: 0.8em;
    }
  }
}
</style>
