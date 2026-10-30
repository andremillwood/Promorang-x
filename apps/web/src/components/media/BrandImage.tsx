import {useState,type ImgHTMLAttributes} from "react";
import {brandPlaceholder,usableArtwork,type BrandImageContext} from "@/lib/brand-imagery";
import "./BrandImage.css";

type Props=Omit<ImgHTMLAttributes<HTMLImageElement>,"src"|"srcSet"|"onError"> & BrandImageContext & {src?:string|null;labelClassName?:string};
/** The parent provides the media frame. A small label distinguishes illustrative art. */
export function BrandImage({src,category,title,description,kind,alt="",loading="lazy",decoding="async",sizes="(max-width: 640px) 100vw, 50vw",style,labelClassName="",...props}:Props) {
 const [failed,setFailed]=useState<string[]>([]);
 const placeholder=brandPlaceholder({category,title,description,kind});
 const uploaded=usableArtwork(src);
 const illustrative=!uploaded || failed.includes(uploaded);
 const current=illustrative ? placeholder.src : uploaded;
 const unavailable=failed.includes(current);
 return <>
  {!unavailable ? <img width={1024} height={683} {...props} src={current} srcSet={illustrative ? placeholder.srcSet : undefined} sizes={illustrative ? sizes : undefined} alt={illustrative ? "" : alt} loading={loading} decoding={decoding} style={illustrative ? {...style,objectPosition:placeholder.objectPosition} : style} data-image-source={illustrative ? "illustrative" : "uploaded"} data-image-category={placeholder.category} onError={()=>setFailed(previous=>previous.includes(current)?previous:[...previous,current])} /> : null}
  {illustrative ? <small className={`brand-image-label ${labelClassName}`} data-image-label={unavailable ? "unavailable" : "illustrative"}>{unavailable ? "Image unavailable" : "Illustrative image"}</small> : null}
 </>;
}
