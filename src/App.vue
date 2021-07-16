<template>
  <div id="app">
    <nav class="navbar navbar-dark bg-info">
      <a class="navbar-brand" href="#">Vue chat</a>
      <!-- ログイン時にはフォームとログアウトボタンを表示 -->
      <div v-if="user.uid" key="login">
        {{ user.displayName }}
        <button type="button" @click="doLogout">logout</button>
      </div>
      <!-- 未ログイン時にはログインボタンを表示 -->
      <div v-else key="logout">
        <button type="button" @click="doLogin">login</button>
      </div>
    </nav>

    <main class="row">
      <div class="channels-container col-md-2">
        <h3>Channels</h3>
        <div class="channels">
          <b-tabs pills card vertical class="list">
            <b-tab @click="changeChannel('#General')" title="#General"></b-tab>
            <b-tab @click="changeChannel('#Weapons')" title="#Weapons"></b-tab>
            <b-tab @click="changeChannel('#Combat')" title="#Combat"></b-tab>
          </b-tabs>
        </div>
      </div>

      <div class="messages col-md-8">
        <h3>Messages</h3>
        <div class="chats">
          <section v-for="talk in chat" :key="talk.id" class="chat">
            <div class="talk-history">
              <div class="talk-name">{{ talk.name }}</div>
              <div class="comment">
                <nl2br tag="div" :text="talk.message" />
              </div>
            </div>
            <div class="talk-addres">
              <p>@john</p>
              <div class="talk-time">
                {{ formatDate(talk.created.toDate()) }}
              </div>
            </div>
          </section>
        </div>
        <div class="send">
          <div>
            <p class="m-0">@john</p>
            <form action="" @submit.prevent="doSend" class="form">
              <textarea
                v-model="input"
                :disabled="!user.uid"
                @keydown.enter.exact.prevent="doSend"
                type="text"
                class="form-control"
                placeholder="Enter Message"
              ></textarea>
              <button
                type="submit"
                :disabled="!user.uid"
                class="btn btn-primary float-right mt-3"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
      <div class="members col-md-2">
        <h3>Members</h3>
        <b-tabs pills card vertical>
          <b-tab
            :title="member.name"
            v-for="member in members"
            :key="member.uid"
          ></b-tab>
        </b-tabs>
      </div>
    </main>
  </div>
</template>

<script>
import firebase from "firebase";
import Nl2br from "vue-nl2br";
export default {
  components: { Nl2br },
  data() {
    //data関数は常に保持したいデータを変数に格納する場所
    return {
      user: {},
      chat: [],
      input: "",
      channel: "#General",
      members: [],
    };
  },

  created() {
    firebase.auth().onAuthStateChanged((user) => {
      this.user = user ? user : {};
      const db = firebase.firestore();
      const Generalcollection = db
        .collection("Channels")
        .doc("#General")
        .collection("chats");

      if (user) {
        // onSnapshotは監視させるメソッド
        // snapshotはファイルかディレクトリの集合
        // チャットの履歴をデータを取ってくる
        //collectionはフォルダでdocumentはファイル
        //onSnapshotはfirestoreのドキュメントを監視している
        //sendボタンを押したときに、documentにデータを追加したとき、onSnapshotで発火
        //orderByは並び替えをするメソッド
        Generalcollection.orderBy("created").onSnapshot((snapshot) => {
          this.chat = [];
          snapshot.forEach((doc) => {
            this.chat.push(Object.assign({ id: doc.id }, doc.data())); //オブジェクトを結合する
            if (
              typeof this.members.find(
                (userData) => userData.uid === doc.data().uid
              ) === "undefined"
            ) {
              this.members.push({
                uid: doc.data().uid,
                name: doc.data().name,
              });
            }
          });
        });
      }
    });
  },

  methods: {
    //クリックしたときに実行したい処理を書くところ・関数を定義するところ
    doLogin() {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider);
    },

    doLogout() {
      firebase.auth().signOut();
    },

    doSend() {
      const db = firebase.firestore();
      const collection = db
        .collection("Channels")
        .doc(this.channel)
        .collection("chats");
      if (this.input === "") {
        return;
      }

      collection
        .add({
          message: this.input,
          name: this.user.displayName,
          created: new Date(),
          uid: this.user.uid,
        })
        .then((doc) => {
          console.log(`${doc.id} added!`);
          this.input = "";
        });
    },

    formatDate(d) {
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const hour = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
      const min = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
      const sec = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();
      return (
        year +
        "-" +
        month +
        "月" +
        day +
        "日" +
        hour +
        ":" +
        min +
        ":" +
        sec +
        ""
      );
    },
    changeChannel(channel) {
      this.channel = channel;
      /*Channelsの切り替え
      #Generalから#Weaponsや#Combatのボタンを押したときに
      Messageの内容が変わる*/
      /*Messageの内容を変えたい場合
      firebaseのfirestoreからdataをとってくると同時に#Generalのチャットのdataを表示を消す*/
      const db = firebase.firestore();
      const collection = db
        .collection("Channels")
        .doc(this.channel)
        .collection("chats");
      collection.orderBy("created").onSnapshot((snapshot) => {
        this.chat = [];
        this.members = [];
        snapshot.forEach((doc) => {
          this.chat.push(Object.assign({ id: doc.id }, doc.data()));
          if (
            typeof this.members.find(
              (userData) => userData.uid === doc.data().uid
            ) === "undefined"
          ) {
            this.members.push({
              uid: doc.data().uid,
              name: doc.data().name,
            });
          }
        });
      });
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
  overflow: hidden;
}
.card-header {
  background-color: white !important;
}
.row {
  margin-top: 20px;
  height: 100%;
}
h3 {
  margin-left: 10px;
  border-bottom: 1px solid;
  padding-bottom: 10px;
}
.chats {
  height: 60%;
  overflow-y: scroll;
}
.send {
  height: 10%;
}
.send p {
  color: gray;
}
.name {
  display: flex;
  justify-content: space-between;
}
.chat {
  display: flex;
  justify-content: space-between;
  border: 1px solid gray;
  padding: 0 3px;
}
.talk-fistory {
  display: flex;
  flex-direction: column;
}
.talk-addres {
  display: flex;
  flex-direction: column;
  color: gray;
}
.talk-time {
  margin-top: 16px;
}
.comment {
  color: gray;
}
.form-control {
  resize: none;
}
</style>
