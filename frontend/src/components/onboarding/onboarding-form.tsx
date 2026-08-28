'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Camera, FileUp, Loader2, Send } from 'lucide-react'
import { ResultModal } from './result-modal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'
import { apiFetch } from '@/lib/api'

type VerificationResult = {
  status: 'success' | 'failed'
  data?: {
    Name: string
    "Father's Name"?: string
    DOB?: string
    "Date of Birth"?: string
    "PAN Number": string
    Address: string
    verificationStatus?: string
    "PAN Number (Masked)"?: string
  }
  reason?: string
  message?: string
}

export function OnboardingForm() {
  const [name, setName] = useState('')
  const [panFile, setPanFile] = useState<File | null>(null)
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState<File | null>(null)
  const [aadhaarBackFile, setAadhaarBackFile] = useState<File | null>(null)
  const [selfie, setSelfie] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const { toast } = useToast()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async () => {
    setShowCamera(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Error accessing camera: ", err)
      setShowCamera(false)
      toast({
        variant: 'destructive',
        title: 'Camera Error',
        description: 'Could not access the camera. Please check permissions.',
      })
    }
  }, [toast])

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setShowCamera(false)
    }
  }, [])

  const takeSelfie = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight)
        const dataUrl = canvasRef.current.toDataURL('image/jpeg')
        setSelfie(dataUrl)
        stopCamera()
      }
    }
  }, [stopCamera])
  
  const b64toFile = (b64Data:string, filename:string, contentType:string) => {
    const sliceSize = 512;
    const byteCharacters = atob(b64Data.split(',')[1]);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new File(byteArrays, filename, {type: contentType});
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !panFile || !aadhaarFrontFile || !aadhaarBackFile || !selfie) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all fields and capture a selfie.',
      })
      return
    }
    setIsLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('pan', panFile)
    formData.append('aadhaar_front', aadhaarFrontFile)
    formData.append('aadhaar_back', aadhaarBackFile)
    formData.append('selfie', b64toFile(selfie, 'selfie.jpg', 'image/jpeg'))

    try {
      const response = await apiFetch('/api/kyc/onboard', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();
      
      let apiResult: VerificationResult;

      // Check for the new error structure { "detail": { ... } }
      if (responseData.detail && typeof responseData.detail === 'object') {
        apiResult = responseData.detail;
      } else {
        apiResult = responseData;
      }
      
      setResult(apiResult);

      if (!response.ok || apiResult.status === 'failed') {
        throw new Error(apiResult.reason || apiResult.message || 'Onboarding failed');
      }
      
    } catch (err: any) {
       const errorMessage = err.message || 'An unexpected error occurred.';
       // The result state is already set from the response, but we can set it here for network errors
       if(!result) {
         setResult({ status: 'failed', reason: errorMessage });
       }
       toast({
        variant: 'destructive',
        title: 'Onboarding Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const isFormComplete = name && panFile && aadhaarFrontFile && aadhaarBackFile && selfie;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Client & Document Details</CardTitle>
                    <CardDescription>Enter client's name and upload PAN and Aadhaar images.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" type="text" placeholder="Enter client's full name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pan">PAN Card Front</Label>
                        <Input id="pan" type="file" accept="image/*" onChange={(e) => setPanFile(e.target.files?.[0] || null)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="aadhaar-front">Aadhaar Card Front</Label>
                        <Input id="aadhaar-front" type="file" accept="image/*" onChange={(e) => setAadhaarFrontFile(e.target.files?.[0] || null)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="aadhaar-back">Aadhaar Card Back</Label>
                        <Input id="aadhaar-back" type="file" accept="image/*" onChange={(e) => setAadhaarBackFile(e.target.files?.[0] || null)} required />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Live Selfie</CardTitle>
                    <CardDescription>Capture a live selfie for verification.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {showCamera && <video ref={videoRef} autoPlay className="h-full w-full object-cover"></video>}
                        {selfie && !showCamera && <Image src={selfie} alt="selfie" width={400} height={225} className="h-full w-full object-cover" />}
                        {!showCamera && !selfie && <Camera className="h-16 w-16 text-muted-foreground" />}
                    </div>
                     <canvas ref={canvasRef} className="hidden"></canvas>
                     {showCamera ? (
                        <div className='flex gap-2'>
                             <Button type="button" onClick={takeSelfie} className='w-full'>
                                <Camera className="mr-2 h-4 w-4" /> Take Selfie
                            </Button>
                            <Button type="button" onClick={stopCamera} variant="outline" className='w-full'>Cancel</Button>
                        </div>
                     ) : (
                        <Button type="button" onClick={startCamera} className='w-full'>
                            <Camera className="mr-2 h-4 w-4" /> {selfie ? 'Retake' : 'Open'} Camera
                        </Button>
                     )}
                </CardContent>
            </Card>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={!isFormComplete || isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Verify & Onboard Client
          </Button>
        </div>
      </form>
      {result && <ResultModal result={result} open={!!result} onOpenChange={() => setResult(null)} />}
    </>
  )
}
