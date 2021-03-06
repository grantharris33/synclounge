<template>
  <span v-if="server">
    <v-layout v-if="!libraries && !browsingLibrary && !selectedItem" row align-center>
      <v-flex xs12 style="position: relative">
        <v-progress-circular style="left:50%; top:50%" v-bind:size="60" indeterminate class="amber--text"></v-progress-circular>
      </v-flex>
    </v-layout>
    <div v-if="!browsingLibrary && !selectedItem && libraries" class="mt-3">
        <div v-if="!libraries && !browsingLibrary">
          <v-progress-circular active large></v-progress-circular>
        </div>
        <h4> Libraries </h4>
        <v-layout row wrap v-if="libraries && !browsingLibrary">
          <v-flex xs12 md3 xl2 lg2  v-for="library in filteredLibraries" class="pa-1" :key="library.name">
            <v-card v-on:click.native="setLibrary(library)" :img="getArtLibrary(library)" flat class="clickable text-xs-center" style="max-width:100%; cursor: pointer; border-radius: 0px !important">
              <div style="position:relative; width:100%; background: rgba(0,0,0,0.4); height:8em" class="hidden-xs-only">
                <img style="height: 70%; display: block; margin-left: auto; margin-right: auto " :src="getThumb(library)" />
              </div>
              <div style="background: rgba(0,0,0,0.7); position:relative; width:100%;" class="text-xs-center pa-1">
                <h2 class="truncate text-xs-left text-sm-center">{{ library.title }}</h2>
              </div>
            </v-card>
          </v-flex>
        </v-layout>
        <v-divider v-if="subsetOnDeck(onDeckItemsPer).length > 0" class="mt-3 ma-2"></v-divider>
        <v-layout row wrap v-if="subsetOnDeck(onDeckItemsPer).length > 0">
          <v-flex xs6>
            <h4>On Deck</h4>
          </v-flex>
          <v-flex xs6>
            <span style="float:right; user-select: none;">
              <v-icon @click="onDeckDown" style="margin-right: 15px;cursor: pointer" :style="onDeckDownStyle">fa-angle-left</v-icon><v-icon  @click="onDeckUp" :style="onDeckUpStyle" style="cursor: pointer">fa-angle-right</v-icon>
            </span>
          </v-flex>
        </v-layout>
        <v-layout v-if="onDeck" row wrap>
          <v-flex xs12 sm6 md4 lg3 class="pb-3 pa-1" v-for="content in subsetOnDeck()" :key="content.key">
            <plexthumb :content="content" :server="server" type="art" @contentSet="setContent(content)"></plexthumb>
          </v-flex>
        </v-layout>
        <v-divider v-if="subsetRecentlyAdded(recentItemsPer).length > 0" class="mt-3 ma-2"></v-divider>
        <v-layout row wrap v-if="subsetRecentlyAdded(recentItemsPer).length > 0">
          <v-flex xs6>
            <h4>Recently Added</h4>
          </v-flex>
          <v-flex xs6>
            <span style="float:right; user-select: none;"> <v-icon fa @click="recentlyAddedDown" style="margin-right: 15px;cursor: pointer;" :style="recentlyAddedDownStyle">fa-angle-left</v-icon><v-icon fa :style="recentlyAddedUpStyle"  @click="recentlyAddedUp" style="cursor: pointer">fa-angle-right</v-icon>
            </span>
          </v-flex>
        </v-layout>
        <v-layout v-if="recentlyAdded" class="row pt-2" row wrap justify-space-between>
          <v-flex xs4 sm2 md1 xl1 lg1 class="pb-3 pa-3" v-for="content in subsetRecentlyAdded(recentItemsPer)" :key="content.key">
            <plexthumb :content="content" :server="server" type="thumb" fullTitle locked @contentSet="setContent(content)"></plexthumb>
          </v-flex>
        </v-layout>
    </div>
  </span>
</template>

<script>
const plexthumb = require('./plexthumb.vue');

const _ = require('lodash');

export default {
  components: {
    plexthumb,
  },
  created() {
  },
  data() {
    return {
      browsingLibrary: null,
      selectedItem: null,

      libraries: null,
      status: 'loading..',

      recentlyAdded: null,
      onDeck: null,

      onDeckOffset: 0,
      recentlyAddedOffset: 0,
    };
  },
  async mounted() {
    this.server.getAllLibraries().then((data) => {
      if (data) {
        this.libraries = data;
      } else {
        this.status = 'Error loading libraries!';
      }
    });
    this.server.getRecentlyAddedAll(0, 12).then((result) => {
      if (result) {
        this.recentlyAdded = result;
        this.setBackground();
      }
    });
    this.updateOnDeck();
  },
  beforeDestroy() {

  },
  computed: {
    recentItemsPer() {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs': return 3;
        case 'sm': return 6;
        case 'md': return 36;
        case 'lg': return 36;
        case 'xl': return 48;
      }
    },
    onDeckItemsPer() {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs': return 1;
        case 'sm': return 2;
        case 'md': return 3;
        case 'lg': return 4;
        case 'xl': return 4;
      }
    },
    clientIdentifier() {
      return this.$route.params.machineIdentifier;
    },
    server() {
      return this.plex.servers[this.clientIdentifier];
    },
    plex() {
      return this.$store.getters.getPlex;
    },
    filteredLibraries() {
      let data = [];
      if (this.libraries) {
        this.libraries.MediaContainer.Directory.forEach((library) => {
          if(library.type != 'artist' || library.agent != 'tv.plex.agents.music') {
            data.push(library);
          }
        });
      }
      return data;
    },
    onDeckUpStyle() {
      if ((this.onDeckOffset + this.onDeckItemsPer) >= this.onDeck.MediaContainer.Metadata.length) {
        return {
          opacity: 0.5,
        };
      }
    },
    onDeckDownStyle() {
      if (this.onDeckOffset === 0) {
        return {
          opacity: 0.5,
        };
      }
    },
    recentlyAddedDownStyle() {
      if (this.recentlyAddedOffset === 0) {
        return {
          opacity: 0.5,
        };
      }
    },
    recentlyAddedUpStyle() {
      if ((this.recentlyAddedOffset + this.recentItemsPer) >= this.recentlyAdded.MediaContainer.Metadata.length) {
        return {
          opacity: 0.5,
        };
      }
    },

  },
  methods: {
    setContent(content) {
      this.selectedItem = content;
    },
    setLibrary(library) {
      this.$router.push(`/browse/${this.server.clientIdentifier}/${library.key}`);
      // this.browsingLibrary = library
    },
    updateOnDeck() {
      this.server.getOnDeck(0, 10).then((result) => {
        if (result) {
          this.onDeck = result;
        }
      });
    },
    onDeckDown() {
      if (!this.onDeck || !this.onDeck.MediaContainer || !this.onDeck.MediaContainer.Metadata) {
        return false;
      }
      if (this.onDeckOffset - this.onDeckItemsPer < 0) {
        this.onDeckOffset = 0;
      } else {
        this.onDeckOffset = this.onDeckOffset - 4;
      }
    },
    onDeckUp() {
      if (!this.onDeck || !this.onDeck.MediaContainer || !this.onDeck.MediaContainer.Metadata) {
        return false;
      }
      if (this.onDeckOffset + this.onDeckItemsPer >= this.onDeck.MediaContainer.Metadata.length) {
        // This would overflow!
      } else {
        this.onDeckOffset = this.onDeckOffset + this.onDeckItemsPer;
      }
    },
    recentlyAddedUp() {
      if (!this.recentlyAdded || !this.recentlyAdded.MediaContainer || !this.recentlyAdded.MediaContainer.Metadata) {
        return false;
      }
      if (this.recentlyAddedOffset + this.recentItemsPer >= this.recentlyAdded.MediaContainer.Metadata.length) {
        // This would overflow!
      } else {
        this.recentlyAddedOffset = this.recentlyAddedOffset + this.recentItemsPer;
      }
    },
    recentlyAddedDown() {
      if (!this.recentlyAdded || !this.recentlyAdded.MediaContainer || !this.recentlyAdded.MediaContainer.Metadata) {
        return false;
      }
      if (this.recentlyAddedOffset - this.recentItemsPer < 0) {
        this.recentlyAddedOffset = 0;
      } else {
        this.recentlyAddedOffset = this.recentlyAddedOffset - this.recentItemsPer;
      }
    },
    setBackground() {
      const w = Math.round(Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
      const h = Math.round(Math.max(document.documentElement.clientHeight, window.innerHeight || 0));

      const randomItem = _.sample(this.recentlyAdded.MediaContainer.Metadata);
      const url = randomItem.art;
      this.$store.commit('SET_BACKGROUND', this.server.getUrlForLibraryLoc(url, w / 4, h / 1, 6));
    },
    subsetOnDeck() {
      if (!this.onDeck || !this.onDeck.MediaContainer || !this.onDeck.MediaContainer.Metadata) {
        return [];
      }
      return this.onDeck.MediaContainer.Metadata.slice(this.onDeckOffset, this.onDeckOffset + this.onDeckItemsPer);
    },
    subsetRecentlyAdded() {
      if (!this.recentlyAdded || !this.recentlyAdded.MediaContainer || !this.recentlyAdded.MediaContainer.Metadata) {
        return [];
      }
      return this.recentlyAdded.MediaContainer.Metadata.slice(this.recentlyAddedOffset, this.recentlyAddedOffset + this.recentItemsPer);
    },
    progress(content) {
      let perc = (parseInt(content.viewOffset) / parseInt(content.duration)) * 100;
      if (isNaN(perc)) {
        perc = 0;
      }
      return `${perc}%`;
    },
    getArt(object) {
      const w = Math.round(Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
      const h = Math.round(Math.max(document.documentElement.clientHeight, window.innerHeight || 0));
      return this.server.getUrlForLibraryLoc(object.art, w / 1, h / 1);
    },
    getArtLibrary(object) {
      const w = Math.round(Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
      const h = Math.round(Math.max(document.documentElement.clientHeight, window.innerHeight || 0));
      return this.server.getUrlForLibraryLoc(object.art, w / 1, h / 1, 15);
    },
    getThumb(object) {
      const w = Math.round(Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
      const h = Math.round(Math.max(document.documentElement.clientHeight, window.innerHeight || 0));
      return this.server.getUrlForLibraryLoc(object.thumb, w / 4, h / 4);
    },
    getTitleMovie(movie) {
      if (movie.year) {
        return `${movie.title} (${movie.year})`;
      }
      return movie.title;
    },
    getGrandparentThumb(object) {
      const w = Math.round(Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
      const h = Math.round(Math.max(document.documentElement.clientHeight, window.innerHeight || 0));
      return this.server.getUrlForLibraryLoc(object.grandparentThumb, w / 3, h / 4);
    },
    reset() {
      this.updateOnDeck();
      this.browsingLibrary = false;
      this.selectedItem = false;
      this.setBackground();
    },

  },
};
</script>
