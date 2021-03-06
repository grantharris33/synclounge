<template>
  <v-container fill-height class="pa-0" style="height: 100%">
    <v-layout row wrap justify-space-between>
      <v-flex xs12>
        <v-list class="pa-1 left-sidebar-list" dense style="background: none;">
          <template>
            <v-list-tile v-if="plex && plex.user">
              <v-list-tile-avatar>
                <img class="pa-1" :src="plex.user.thumb" />
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title style="font-weight: bold">{{ ALTUSERNAME }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider></v-divider>
            <v-subheader>Preferences</v-subheader>
            <v-list-tile @click.stop="ptsettingstoggle = !ptsettingstoggle" class="text-xs-center">
              <v-list-tile-action>
                <v-icon color="white">settings</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>SyncedWatch Settings</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile
              v-if="plex && plex.gotDevices"
              @click.stop="plexsettingstoggle = !plexsettingstoggle"
            >
              <v-list-tile-action>
                <v-icon color="white">settings</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Video Settings</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-subheader v-if="plex && plex.gotDevices">Account</v-subheader>
            <v-list-tile :router="true" to="/signout">
              <v-list-tile-action>
                <v-icon color="white">cancel</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Sign out</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-subheader>About</v-subheader>
            <v-list-tile href="https://github.com/grantharris33/syncedwatch" target="_blank">
              <v-list-tile-action>
                <v-icon color="white">info</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>SyncedWatch v{{appVersion}}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>
      </v-flex>

      <v-spacer></v-spacer>
      <v-flex xs12>
        <v-layout row wrap justify-end align-end style="height: 100%">
          <v-flex xs12>
            <v-divider></v-divider>
            <div class="text-xs-center pa-2" style="opacity: 0.7; font-size: 12px">
              <div>Build #{{ hash }}</div>
              <div>Last updated {{ updatedAt }}</div>
            </div>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>

    <v-dialog v-model="ptsettingstoggle" width="350">
      <v-card style="background-color: #151924" class="pa-3">
        <div class="text-xs-center">
          <h2>SyncedWatch Settings</h2>
        </div>
        <v-divider class="mt-2 mb-2"></v-divider>
        <ptsettings class="darken-4 pa-1"></ptsettings>
      </v-card>
    </v-dialog>
    <v-dialog v-model="plexsettingstoggle" width="350">
      <v-card style="background-color: #151924" class="pa-3">
        <div class="text-xs-center">
          <h2>Video Settings</h2>
        </div>
        <v-divider class="mt-2 mb-2"></v-divider>
        <plexsettings class="darken-4 pa-1" v-if="validPlex && plex.gotDevices"></plexsettings>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import ptsettings from "./components/application/settings";
import plexsettings from "./components/application/plexsettings";
import donate from "./donate";

const moment = require("moment");

export default {
  components: {
    ptsettings,
    plexsettings,
    donate
  },
  data() {
    return {
      ptsettingstoggle: false,
      plexsettingstoggle: false,
      donateDialog: false
    };
  },
  computed: {
    ALTUSERNAME: {
      get() {
        return this.$store.getters.getSettings.ALTUSERNAME;
      },
      set(value) {
        this.$store.commit('setSetting', ['ALTUSERNAME', value]);
      },
    },
    plex() {
      return this.$store.getters.getPlex;
    },
    hash() {
      return process.env.gitHash;
    },
    date() {
      return process.env.gitDate;
    },
    updatedAt() {
      return moment(this.date).fromNow();
    },
    chosenClient() {
      return this.$store.getters.getChosenClient;
    },
    validPlex() {
      if (!this.$store.state.plex) {
        return false;
      }
      return true;
    },
    appVersion() {
      return this.$store.state.appVersion;
    },
    validDevices() {
      if (!this.plex) {
        return false;
      }
      return this.plex.gotDevices;
    },
    showBrowser() {
      return (
        this.chosenClient &&
        !this.chosenClient.clientPlayingMetadata &&
        this.ptRoom
      );
    },
    isPTPlayer() {
      return (
        this.chosenClient &&
        this.chosenClient.clientIdentifier === "PTPLAYER9PLUS10"
      );
    },
    showMetadata() {
      return (
        !this.isPTPlayer &&
        !this.showBrowser &&
        this.chosenClient &&
        this.chosenClient.clientPlayingMetadata
      );
    },
    darkMode() {
      return this.$store.getters.getSettingDARKMODE;
    },
    ptConnected() {
      return this.$store.getters.getConnected;
    },
    ptServer() {
      return this.$store.getters.getServer;
    },
    ptRoom() {
      return this.$store.getters.getRoom;
    },
    ptPassword() {
      return this.$store.getters.getPassword;
    },
    ptUsers() {
      return this.$store.getters.getUsers;
    },
    userCount() {
      const count = this.$store.getters.getUsers.length;
      if (count === 1) {
        return `${count} user`;
      }
      return `${count} users`;
    },
    chatBoxMessage() {
      return `Message ${this.$store.getters.getRoom}`;
    },
    playercount() {
      if (this.$store.state.plex && this.$store.state.plex.gotDevices) {
        return `(${this.$store.state.plex.clients.length})`;
      }
      return "";
    },
    servercount() {
      if (this.$store.state.plex && this.$store.state.plex.gotDevices) {
        return `(${this.$store.state.plex.servers.length})`;
      }
      return "";
    },
    showChatValue() {
      if (this.$store.getters.getShownChat) {
        return "block";
      }
      return "none";
    },
    messages() {
      return this.$store.getters.getMessages;
    }
  },
  methods: {
    isHost(user) {
      return user.role === "host";
    },
    percent(user) {
      let perc = (parseInt(user.time) / parseInt(user.maxTime)) * 100;
      if (isNaN(perc)) {
        perc = 0;
      }
      return perc;
    },
    getCurrent(user) {
      if (isNaN(user.time)) {
        return this.getTimeFromMs(0);
      }
      return this.getTimeFromMs(user.time);
    },
    getMax(user) {
      if (isNaN(user.maxTime)) {
        return this.getTimeFromMs(0);
      }
      return this.getTimeFromMs(user.maxTime);
    },
    getTitle(user) {
      if (user.title && user.title.length > 0) {
        return user.title;
      }
      return "Nothing";
    },
    sendMessage() {
      this.$store.dispatch("sendNewMessage", this.messageToBeSent);
      this.messageToBeSent = "";
    },
    playerState(user) {
      if (user.playerState) {
        if (user.playerState === "stopped") {
          return "pause";
        }
        if (user.playerState === "paused") {
          return "pause";
        }
        if (user.playerState === "playing") {
          return "play_arrow";
        }
      }
      return false;
    },
    getTimeFromMs(ms) {
      const hours = ms / (1000 * 60 * 60);
      const absoluteHours = Math.floor(hours);
      const h = absoluteHours > 9 ? absoluteHours : `0${absoluteHours}`;
      const minutes = (hours - absoluteHours) * 60;
      const absoluteMinutes = Math.floor(minutes);
      const m = absoluteMinutes > 9 ? absoluteMinutes : `0${absoluteMinutes}`;
      const seconds = (minutes - absoluteMinutes) * 60;
      const absoluteSeconds = Math.floor(seconds);
      const s = absoluteSeconds > 9 ? absoluteSeconds : `0${absoluteSeconds}`;
      return `${h}:${m}:${s}`;
    }
  }
};
</script>

<style scoped>
.v-list__tile__action {
  justify-content: center;
}
</style>