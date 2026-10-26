-- Keep existing image permissions and permit optimized case MP4 uploads.
-- NULL already means unrestricted; do not change existing Storage policies.
update storage.buckets
set allowed_mime_types = case
      when allowed_mime_types is null then null
      when 'video/mp4' = any(allowed_mime_types) then allowed_mime_types
      else array_append(allowed_mime_types, 'video/mp4')
    end,
    file_size_limit = case
      when file_size_limit is null then null
      else greatest(file_size_limit, 26214400)
    end
where id = 'case-images';
