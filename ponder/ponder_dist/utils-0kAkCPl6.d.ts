/**
 * @description Combines members of an intersection into a readable type.
 *
 * @link https://twitter.com/mattpocockuk/status/1622730173446557697?s=20&t=NdpAcmEFXY01xkqU3KO0Mg
 * @example
 * Prettify<{ a: string } | { b: string } | { c: number, d: bigint }>
 * => { a: string, b: string, c: number, d: bigint }
 */
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
/**
 * @description Returns true if T only has a property named "id".
 */
type HasOnlyIdProperty<T> = Exclude<keyof T, "id"> extends never ? true : false;
/**
 * @description Creates a union of the names of all the required properties of T.
 */
type RequiredPropertyNames<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];
type HasRequiredPropertiesOtherThanId<T> = Exclude<RequiredPropertyNames<T>, "id"> extends never ? false : true;

export type { HasOnlyIdProperty as H, Prettify as P, HasRequiredPropertiesOtherThanId as a };
