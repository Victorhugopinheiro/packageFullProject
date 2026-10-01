import { Loader, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import UserPicture from "../../../../public/UserPicture.png"
interface ChangeImageProps {
    setImage: (image: File | null) => void;
    userImage?: string | null;
    disabled?: boolean;
}

export function ChangeImage({ setImage, userImage, disabled }: ChangeImageProps) {



    const [preview, setPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        setLoading(true)
        if (e.target.files && e.target.files.length > 0) {

            const file = e.target.files[0]

            if (file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/jpg") {
                alert("Please select a valid image file (JPEG, PNG, JPG).")
                return
            }

            setImage(file)
            setPreview(URL.createObjectURL(file))
        }
    }



    return (
        <div className="relative w-40 h-40 md:w-48 md:h-48   ">

            <div className="flex bg-muted rounded-full w-full relative h-full items-center justify-center">

                <span className="absolute rounded-full  z-2 cursor-pointer flex items-center justify-center  ">
                    <Upload className=" w-6 h-6 bg-white/20 rounded-full " />
                </span>

                <input
                    disabled={disabled}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
            </div>

            {preview ? (
                <Image className="rounded-full absolute z-1  w-full h-48 object-cover" src={preview} alt="Avatar user" fill priority />
            ) : userImage ? (<Image className="rounded-full absolute z-1  w-full h-48 object-cover" src={userImage} alt="Avatar user" fill priority />) :

                (<Image className="rounded-full absolute z-1  w-full h-48 object-cover" src={UserPicture} alt="Avatar user" fill priority />)}



        </div>
    )

}