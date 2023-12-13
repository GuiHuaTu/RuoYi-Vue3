import JSEncrypt from 'jsencrypt/bin/jsencrypt.min'

// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKoR8mX0rGKLqzcWmOzbfj64K8ZIgOdH\n' +
  'nzkXSOVOZbFu/TJhZ7rFAN+eaGkl3C4buccQd/EjEsj9ir7ijT7h96MCAwEAAQ=='

const privateKey = 'MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEAqhHyZfSsYourNxaY\n' +
  '7Nt+PrgrxkiA50efORdI5U5lsW79MmFnusUA355oaSXcLhu5xxB38SMSyP2KvuKN\n' +
  'PuH3owIDAQABAkAfoiLyL+Z4lf4Myxk6xUDgLaWGximj20CUf+5BKKnlrK+Ed8gA\n' +
  'kM0HqoTt2UZwA5E2MzS4EI2gjfQhz5X28uqxAiEA3wNFxfrCZlSZHb0gn2zDpWow\n' +
  'cSxQAgiCstxGUoOqlW8CIQDDOerGKH5OmCJ4Z21v+F25WaHYPxCFMvwxpcw99Ecv\n' +
  'DQIgIdhDTIqD2jfYjPTY8Jj3EDGPbH2HHuffvflECt3Ek60CIQCFRlCkHpi7hthh\n' +
  'YhovyloRYsM+IS9h/0BzlEAuO0ktMQIgSPT3aFAgJYwKpqRYKlLDVcflZFCKY7u3\n' +
  'UP8iWi1Qw0Y='

  const publicKeyLogin = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC2Cy8TIHTdsNi4prgovXoMwcmeGB2tpjH6emxhxNAbGy5mgF8X2UnGpjnuF/R6XmlLN6Q5vyxHLnsN0o1D4RoIbvZsvHDRPS3TfAGWfaJu+mR9TIY6P9sNCptwp56yvb0UCpdKj1k0vuwbEk4MOmhDJX48C852May/jTNsPy4ixQIDAQAB';

  const privateKeyLogin = 'MIICXAIBAAKBgQC2Cy8TIHTdsNi4prgovXoMwcmeGB2tpjH6emxhxNAbGy5mgF8X2UnGpjnuF/R6XmlLN6Q5vyxHLnsN0o1D4RoIbvZsvHDRPS3TfAGWfaJu+mR9TIY6P9sNCptwp56yvb0UCpdKj1k0vuwbEk4MOmhDJX48C852May/jTNsPy4ixQIDAQABAoGBAJiGWlTONtygFZTwqxAHYUFbBJBfaE5cFzfkZvarriln5sKfAA29UuEL2TGyBHaar+IDpqdzk6e4PAXiydV7vxCzcykEhuyOUsfMtmi1r/INeBtKgZc8vX/RTWleJq/uSO0vlCzLi1x1rpnxgvafBjalK65191JscZ/zH2JOgNJBAkEA5SM3zH9cxHZBF+ghDs+tQOqvqkTfInrUA0/nbCygP28erKBF499F7u6vOsKaqaczSerl7XZ5hWWU8ixJ1u/P3QJBAMtimpCXuMHcQNVS9JHoYZCzHdICsCt/svy78oGS4l2qUZBY7BLRPJnDjlw1ElE5NS03z3B0djUmXvCNzJ+r5AkCQCCe3Oi+EQTfGPFAWMR1CGM/hfali2arOdem3nll+QJO3X0R7CE+vgP/8u5YmhAg/4o8aLNftHkrNwMrDvAMf/kCQEzusXS8T2DVRZjr1iNS+YTYnBESfz0VAsli9qpYu1Oe11d4q2O6zeeD91edo54hu6GtGMR66TPVndf0a1CCnrECQAYwA8/TEpKYB5GtGauuOv+V/57UvixyKMDpubBk5JuFXTbyrahmZapVuPA9pYWl05DdwgeKqAS7PE8RqGvQu0M=';
  
// 加密
export function encrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}

// 解密
export function decrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKey) // 设置私钥
  return encryptor.decrypt(txt) // 对数据进行解密
}


// 加密Login
export function encryptLogin(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKeyLogin) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}

// 解密Login
export function decryptLogin(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKeyLogin) // 设置私钥
  return encryptor.decrypt(txt) // 对数据进行解密
}
