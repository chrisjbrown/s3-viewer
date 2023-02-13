<script setup>
import { ref, computed } from 'vue';
import Modal from './components/Modal.vue';
import { listObjects, addImage } from './services/s3';

const currentPath = ref([]);
const selectedImage = ref(null);
const dirs = ref([]);
const images = ref([]);
const loading = ref(true);
const currentPrefix = ref('/');
const filterText = ref("");
const filteredImages = computed(() => {
	if (filterText.value) {
		return images.value?.filter((image) => image.key.toLowerCase().includes(filterText.value.toLowerCase()))
	}
	return images.value;
});
const currentPathString = computed(() => {
  return currentPath.value.join("/") || "";
});
const previousDir = computed(() => {
  if (!currentPathString.value) {
    return "";
  }
  const path = currentPathString.value.substring(0, currentPathString.value.length - 1)
  return path.includes("/") ? path.substring(0, path.lastIndexOf("/")) : "root";
});

function onFilter (event) {
	filterText.value = event.target.value;
}

async function onAddImage(event) {
  try {
    await addImage(currentPathString.value, event.target.files);
    getFolder();
  } catch (error) {
    alert(`error adding image: ${error}`);
  }
}

function onSelectImage(image) {
  selectedImage.value = image;
}

function onModalClose() {
  selectedImage.value = null;
}

function onDeleteImage() {
  selectedImage.value = null;
  getFolder();
}


async function getFolder(dirName) {
  try {
    if (dirName) {
      currentPath.value = dirName === "root" ? [""] : dirName.split("/");
    }

    loading.value = true;

    const response = await listObjects(currentPathString.value);

    images.value = response?.Contents?.filter((item) =>
      item.Key.match(/jpeg|jpg|webp|png/g)
    ).map((photo) => {
      const name = photo.Key.substring(
        photo.Key.lastIndexOf('/') + 1,
        photo.Key.length
      );
      return {
        src: import.meta.env.VITE_BUCKET_URL + encodeURIComponent(photo.Key),
        key: name,
      };
    });

    if (response.CommonPrefixes) {
      dirs.value = response.CommonPrefixes.filter(
        (item) => item.Prefix !== 'assets/'
      ).map((commonPrefix) => {
        const prefix = commonPrefix.Prefix;
        return decodeURIComponent(prefix);
      });
    } else {
      dirs.value = [];
    }
  } catch (err) {
    return alert('There was an error viewing your directory: ' + err.message);
  } finally {
    currentPrefix.value = dirName;
    loading.value = false;
  }
}

getFolder();
</script>

<template>
  <div>
    <div class="heading">
      <h1>
        Directories
      </h1>
      <span>PATH: </span>
      <code>{{ currentPathString }}</code>
    </div>
    
    <div class="dir-list">
      <button v-if="previousDir" @click="getFolder(previousDir)">
        Back to {{ previousDir }}
      </button>
      <button v-for="(dir, index) in dirs" :key="index" @click="getFolder(dir)">
        {{ dir }}
      </button>
    </div>
    <div v-if="loading" class="loading">loading...</div>
    <div v-else>
			<div class="filter-input">
				<input
					type="text"
					placeholder="filter"
					@input="onFilter"
				/>
			</div>
      <ul class="image-container">
        <li v-for="(image, index) in filteredImages" :key="index">
          <img :src="image.src" class="image" @click="onSelectImage(image)" />
          <div>{{ image.key }}</div>
        </li>
      </ul>
    </div>
    <input
      type="file"
      id="imageupload"
      name="imageupload"
      class="upload"
      accept="image/png, image/jpeg, image/webp, image/jpg"
      @change="onAddImage"
    />
    <Modal
      v-if="selectedImage"
      :name="selectedImage.key"
      :src="selectedImage.src"
      @close="onModalClose"
      @delete="onDeleteImage"
    />
  </div>
</template>

<style scoped lang="scss">
.heading {
  margin-bottom: 2rem;
  h1 {
    margin: 0
  }
}

ul,
li {
  list-style: none;
}

.loading {
  margin-top: 2rem;
}

.dir-list {
  display: flex;
  gap: 2rem;
  justify-content: center;
}
.filter-input {
	margin-top: 20px;

	input {
		width: 400px;
		height: 30px;
	}
}

.image-container {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;

  li {
    img {
      margin: 0 auto;
    }
  }
}
.image {
  display: block;
  max-width: 300px;
  max-height: 300px;
  width: auto;
  height: auto;
  cursor: pointer;
}

.upload {
  position: fixed;
  bottom: 0;
  right: 0;
}

.modal {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 20;
}
</style>
