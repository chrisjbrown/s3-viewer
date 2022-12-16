<script setup>
    import { defineProps } from "vue";
    import { deleteImage } from "../services/s3";

    const props = defineProps({
        name: {
            type: String,
            default: "",
        },
        src: {
            type: String,
            default: "",
        },
    });

    const emit = defineEmits(["close", "delete"]);

    async function onDelete () {
		try {
			await deleteImage(decodeURIComponent(props.src));
			emit("delete");
		} catch (error) {
			alert(`error deleting image ${props.name}: ${error}`);
		}
    }

    function copyText () {
        navigator.clipboard.writeText(props.src);
    }

    function onClose () {
        emit("close");
    }
</script>

<template>
    <div
        class="modal-backdrop"
        @click="onClose"
    >
        <div
			class="modal"
			@click.stop
		>
            <img
                :src="src"
                :alt="name"
                class="image"
                @click="copyText"
            />
            <div class="buttons">
                <button @click="onDelete">
                    Delete
                </button>
                <button @click="copyText">
                    Copy
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
    .modal-backdrop {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.3);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal {
        background: #FFFFFF;
        box-shadow: 2px 2px 20px 1px;
        overflow-x: auto;
        display: flex;
        flex-direction: column;
    }
    .image {
        max-width: 900px;
        max-height: 900px;
        width: auto;
        height: auto;
    }

    .buttons {
        display: flex;
        button {
            width: 100%;
        }
    }
</style>
