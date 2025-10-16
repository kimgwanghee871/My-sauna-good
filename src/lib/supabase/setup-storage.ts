import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Storage Bucket Setup Utility
 * 개발용 - 실제 운영에서는 대시보드나 SQL로 설정 권장
 */
export async function setupStorageBucket() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key 필요
  )

  try {
    // 1. 버킷이 이미 존재하는지 확인
    const { data: existingBuckets } = await supabase.storage.listBuckets()
    const uploadsExists = existingBuckets?.some(bucket => bucket.id === 'uploads')

    if (uploadsExists) {
      console.log('✅ uploads 버킷이 이미 존재합니다')
      return { success: true, message: 'Bucket already exists' }
    }

    // 2. uploads 버킷 생성
    const { data, error } = await supabase.storage.createBucket('uploads', {
      public: true,
      fileSizeLimit: 31457280, // 30MB
      allowedMimeTypes: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    })

    if (error) {
      throw error
    }

    console.log('✅ uploads 버킷이 성공적으로 생성되었습니다')
    
    // 3. RLS 정책 설정 (Service Role로만 가능)
    const { error: policyError } = await supabase.rpc('create_storage_policies')
    
    if (policyError) {
      console.warn('⚠️ RLS 정책 설정 실패:', policyError.message)
      console.warn('대시보드에서 수동으로 정책을 설정해주세요')
    }

    return { success: true, data }

  } catch (error) {
    console.error('❌ 스토리지 버킷 설정 실패:', error)
    return { success: false, error }
  }
}

/**
 * 버킷 설정 검증
 */
export async function verifyStorageSetup() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // 1. 버킷 존재 확인
    const { data: buckets } = await supabase.storage.listBuckets()
    const uploadsExists = buckets?.some(bucket => bucket.id === 'uploads')

    if (!uploadsExists) {
      throw new Error('uploads 버킷이 존재하지 않습니다')
    }

    // 2. 업로드 테스트 (작은 텍스트 파일)
    const testFile = new Blob(['test'], { type: 'text/plain' })
    const testPath = `test/verification-${Date.now()}.txt`
    
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(testPath, testFile)

    if (uploadError) {
      throw new Error(`업로드 테스트 실패: ${uploadError.message}`)
    }

    // 3. 테스트 파일 삭제
    await supabase.storage.from('uploads').remove([testPath])

    console.log('✅ 스토리지 설정이 올바르게 구성되었습니다')
    return { success: true }

  } catch (error) {
    console.error('❌ 스토리지 설정 검증 실패:', error)
    return { success: false, error }
  }
}