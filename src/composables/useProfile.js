import { ref, reactive} from 'vue'

export function useProfile(defaultData, storageKey ='profile') {
    const isEditing = ref(false)
    const imageUrl = ref(null)
    const hovering = ref(false)
    const fileInput = ref(null)
    const originalData = ref({})
    

    const profile = reactive({ ...defaultData})

    const saved = localStorage.getItem(storageKey)
        if (saved) {
    Object.assign(profile, JSON.parse(saved))
    }

    function toggleEdit(){
        if(isEditing.value) {
            Object.assign(profile, originalData.value)
            isEditing.value = false
        }else{
            originalData.value = ({ ...profile})
            isEditing.value = true
        }
    }

    function saveProfile(){
        localStorage.setItem(storageKey, JSON.stringify({...profile}))
        isEditing.value = false
        alert('Saved!')
    }

    function onFileChange(e) {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                imageUrl.value = e.target.result
            }
            reader.readAsDataURL(file)
        }
    }

    function triggerFileInput(){
        fileInput.value?.click()
    }

    function handleImageClick(){
        if (isEditing.value){
            triggerFileInput()
        }
    }

    function validateAge(){
        if (profile.age > 120) profile.age = 120
        else if (profile.age < 1) profile.age = 1
    }

    return {
        profile,
        isEditing,
        imageUrl,
        hovering,
        toggleEdit,
        saveProfile,
        onFileChange,
        triggerFileInput,
        handleImageClick,
        validateAge
    }
}