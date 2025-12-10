'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, Loader2, Crop as CropIcon } from 'lucide-react'
import Image from 'next/image'
import { ImageCropper } from '@/components/ui/image-cropper'

import { cn } from '@/lib/utils'

interface ImageUploadProps {
    value: string
    onChange: (url: string) => void
    placeholder?: string
    aspect?: number
    className?: string
    fit?: 'cover' | 'contain'
}

export function ImageUpload({ value, onChange, placeholder = "이미지 업로드", aspect = 16 / 9, className, fit = 'cover' }: ImageUploadProps) {
    const supabase = createClient()
    const [uploading, setUploading] = useState(false)
    const [cropperOpen, setCropperOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState<string>('')

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0]
            if (file.size > 5 * 1024 * 1024) {
                alert('파일 크기는 5MB를 초과할 수 없습니다.')
                return
            }

            const reader = new FileReader()
            reader.addEventListener('load', () => {
                setSelectedImage(reader.result as string)
                setCropperOpen(true)
            })
            reader.readAsDataURL(file)

            // Reset input value to allow selecting same file again
            event.target.value = ''
        }
    }

    const handleCropComplete = async (croppedBlob: Blob) => {
        try {
            setUploading(true)

            const fileName = `${Math.random()}.jpg`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, croppedBlob, {
                    contentType: 'image/jpeg'
                })

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage.from('images').getPublicUrl(filePath)
            onChange(data.publicUrl)

        } catch (error: any) {
            alert('Error uploading image: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className={cn("space-y-4 w-full", className)}>
            <ImageCropper
                open={cropperOpen}
                onOpenChange={setCropperOpen}
                imageSrc={selectedImage}
                onCropComplete={handleCropComplete}
                aspect={aspect}
            />

            {value ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted group">
                    <Image
                        src={value}
                        alt="Uploaded image"
                        fill
                        className={cn("transition-all", fit === 'contain' ? 'object-contain' : 'object-cover')}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                            onClick={() => {
                                setSelectedImage(value)
                                document.getElementById('image-upload-input')?.click()
                            }}
                            variant="secondary"
                            size="sm"
                        >
                            <CropIcon className="h-4 w-4 mr-2" /> 변경
                        </Button>
                        <Button
                            onClick={() => onChange('')}
                            variant="destructive"
                            size="sm"
                        >
                            <X className="h-4 w-4 mr-2" /> 삭제
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2 h-full">
                    <Button
                        type="button"
                        variant="secondary"
                        disabled={uploading}
                        className="w-full h-full min-h-[100px] relative flex flex-col items-center justify-center gap-2 border-dashed border-2 bg-transparent hover:bg-accent/50"
                    >
                        {uploading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                            <Upload className="h-6 w-6 text-muted-foreground" />
                        )}
                        <span className="text-sm text-muted-foreground font-normal">{uploading ? '업로드 중...' : placeholder}</span>
                        <Input
                            id="image-upload-input"
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={handleFileSelect}
                            accept="image/*"
                            disabled={uploading}
                        />
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center w-full">
                        권장 비율: 16:9 (자동 크롭 지원)
                    </p>
                </div>
            )}
        </div>
    )
}
