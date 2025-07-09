
    export function useProfile(defaultData, storageKey = 'profile'){
        const saved = localStorage.getItem(storageKey)
        return saved ? { ...defaultData, ...JSON.parse(saved) } : { ...defaultData }
    }

    export function saveProfile(profile, storageKey = 'profile') {
        localStorage.setItem(storageKey, JSON.stringify ({ ...profile}))
        alert('Saved!')
    }

    export function validateAge(profile) {
        if (profile.age > 120) profile.age = 120
        else if (profile.age < 1) profile.age = 1
    }

    export function toggleEdit(e) {
        if (e.isEditing) {
            e.profile = { ...e.originalData }
            e.isEditing = false
        } else {
            e.originalData = { ...e.profile }
            e.isEditing = true
        }
    }

    export function handleImageupload(e, callback) {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                callback(e.target.result)
            }
            reader.readAsDataURL(file)
        }
    }



