import Link from "next/link";
import { useEffect, useState } from "react";
import { ReadableArticle } from "../lib/types";
import ArticleCard from "./ArticleCard";

const HERO_SLIDES = [
  "/images/bible_with_leaves.jpg",
  "/images/books.jpg",
  "/images/bibles.jpg",
];

const HERO_VERSES = [
  {
    text: '"...Ako ostanete u mojoj reči, zaista ste moji učenici;<br>I upoznaćete istinu i istina će vas osloboditi."',
    ref: "Jevanđelje po Jovanu 8:31-32",
  },
  {
    text: '"I tražićete me i naći ćete me, jer ćete me tražiti svim srcem svojim."',
    ref: "Knjiga proroka Jeremije 29:13",
  },
  {
    text: '"Dođite k Meni svi koji ste umorni i opterećeni, i Ja ću vas odmoriti."',
    ref: "Jevanđelje po Mateju 11:28",
  },
];

interface HomePageProps {
  latestArticles: ReadableArticle[];
}

export default function HomePage({ latestArticles }: HomePageProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlideIndex((currentValue) => (currentValue + 1) % HERO_SLIDES.length);
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  const activeVerse = HERO_VERSES[activeSlideIndex % HERO_VERSES.length];

  return (
    <>
      <section
        className="hero-section d-flex justify-content-center align-items-center"
        id="section_1"
        aria-label="Naslovna sekcija"
      >
        <div className="hero-slides hero-slides-react">
          {HERO_SLIDES.map((slideImageUrl, index) => (
            <div
              key={slideImageUrl}
              className={`hero-slide ${index === activeSlideIndex ? "is-active" : ""}`}
              style={{ backgroundImage: `url(${slideImageUrl})` }}
            />
          ))}
        </div>

        <div className="hero-quote" aria-label="Biblijski citat">
          <h2 className="text-white">Reč Božija</h2>
          <span
            className="hero-verse-text"
            dangerouslySetInnerHTML={{ __html: activeVerse.text }}
          />
          <em className="small-text hero-verse-ref">{activeVerse.ref}</em>
        </div>
      </section>

      <section className="blog-section section-padding second-section-bg" id="section_2">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-12 col-12 text-center mb-5 pb-lg-2">
              <em className="text-white">U potrazi za mudrošću</em>
              <h2 className="text-white mb-5">Najnoviji članci</h2>
            </div>

            {(latestArticles.length ? latestArticles : []).map((article) => (
              <div className="col-lg-3 col-md-6 col-12 mb-4 article-card-column" key={article.id}>
                <ArticleCard article={article} />
              </div>
            ))}

            {!latestArticles.length
                ? [1, 2, 3, 4].map((index) => (
                  <div className="col-lg-3 col-md-6 col-12 mb-4 article-card-column" key={index}>
                    <div className="blog-section-wrap article-card article-card-standard">
                      <div className="blog-section-info d-flex flex-column">
                        <div className="d-flex mt-auto mb-3">
                          <h4 className="text-white mb-0">Slobodna volja</h4>
                        </div>

                        <p className="text-white mb-0">
                          Zašto ljudi robuju svojim štetnim navikama?
                        </p>
                      </div>

                      <div className="blog-section-image-wrap">
                        <img
                          src="/images/bible_giving.jpg"
                          className="blog-section-image img-fluid"
                          alt="Bog Biblije"
                        />
                      </div>
                    </div>
                  </div>
                ))
              : null}

            <div className="col-12 text-center mt-5">
              <Link href="/clanci" passHref>
                <a className="btn custom-btn custom-border-btn">Ostali članci</a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section section-padding" id="section_3" aria-label="Sveto Pismo Besplatno">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 col-12 mt-4 mt-lg-0 mx-auto section-text">
              <h2 className="text-white mb-3">Sveta Božija Reč</h2>

              <p className="text-white">
                U vremenu kada, prema rečima proroka, „Istina iščezava sa zemlje i pravde nema među
                ljudima“ (Isaija 59:14), a srce čovečije postaje hladno i neosetljivo za potrebe
                drugih, pozvani smo da se vratimo onome što nam jedino preostaje — nepogrešivoj i
                nadahnutoj Božijoj Reči.
              </p>

              <p className="text-white">
                Na našem štandu na sajmovima knjiga posetioci mogu besplatno da preuzmu primerak
                Svetog Pisma, kako bi sami čitali, proučavali i otkrivali istinu bez posredovanja
                ljudskih autoriteta, tradicije ili institucija. Jer vera koja počiva na Božijoj
                reči, a ne na čoveku ili nekoj organizaciji, je Hristova vera koja jedina vodi u
                večni život.
              </p>

              <p className="text-white">
                Za slanje na kućnu adresu obratite nam se putem <br />
                <a
                  rel="nofollow noopener noreferrer"
                  href="https://www.instagram.com/bog_biblije/"
                  target="_blank"
                >
                  instagrama
                </a>{" "}
                ili{" "}
                <a
                  rel="nofollow noopener noreferrer"
                  href="https://www.facebook.com/people/Bog-Biblije/100086580107596/"
                  target="_blank"
                >
                  facebook-a
                </a>
                .
              </p>

              <a
                rel="nofollow noopener noreferrer"
                target="_blank"
                href="https://invite.viber.com/?g2=AQBEs0H7dv2Qw1Rb9wryec4gHV2nyERWSThNrSFi2vNjcVn1fJmIZUTou4pbn9bE"
                className="smoothscroll btn custom-btn custom-border-btn mt-3 mb-4"
              >
                Priključi se
              </a>
            </div>

            <div className="col-lg-6 col-12">
              <div className="ratio ratio-1x1">
                <video
                  preload="none"
                  autoPlay
                  loop
                  muted
                  className="custom-video"
                  poster="/images/bible_giving.jpg"
                  disablePictureInPicture
                  playsInline
                >
                  <source src="/videos/sajam_knjiga_short.mp4" type="video/mp4" />
                </video>

                <div className="about-video-info d-flex flex-column">
                  <h4 className="mt-auto text-start">
                    Osim Svetog Pisma tu su i mnoge druge knjige na temu života u skladu sa Božijim
                    zakonima.
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="second-section section-padding third-section-bg" id="section_4" aria-label="Kamp Deca Neba">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-12">
              <div className="ratio ratio-1x1">
                <video
                  preload="none"
                  autoPlay
                  loop
                  muted
                  className="custom-video"
                  poster="/images/kamp_classroom.jpg"
                  disablePictureInPicture
                  playsInline
                >
                  <source src="/videos/deca-neba-short.mp4" type="video/mp4" />
                </video>

                <div className="about-video-info d-flex flex-column">
                  <h4 className="mt-auto">Već više godina za redom</h4>
                  <h4>raste broj zadovoljnih učesnika.</h4>
                </div>
              </div>
            </div>

            <div className="col-lg-5 col-12 mt-4 mt-lg-0 mx-auto">
              <h2 className="text-white mb-3">Kamp Deca Neba</h2>

              <p className="text-white">
                Ako za svoje dete želite kvalitetno druženje, zdravu fizičku aktivnost, usvajanje
                novih praktičnih veština, učenje biblijskim moralnim vrednostima, učestvovanje u
                raznim predstavama i pevanje pesama, onda je kamp &quot;Deca Neba&quot; idealno mesto
                za vaše dete.
              </p>

              <p className="text-white">
                Više informacija o kampu možete dobiti putem našeg{" "}
                <a
                  rel="nofollow noopener noreferrer"
                  href="https://www.instagram.com/kamp_deca_neba/"
                  target="_blank"
                >
                  Instagrama
                </a>{" "}
                ili{" "}
                <a
                  rel="nofollow noopener noreferrer"
                  href="https://www.facebook.com/groups/pragmatikos/"
                  target="_blank"
                >
                  Facebook-a
                </a>
                .
              </p>

              <a href="tel:+381691726375" className="smoothscroll btn custom-btn custom-border-btn mt-3 mb-4">
                Prijavi se
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section section-padding" id="section_5" aria-label="O nama">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-12 col-12 text-center mb-4 pb-lg-2">
              <em className="text-white">O nama</em>
              <h2 className="text-white">Ko smo mi?</h2>
            </div>

            <p className="text-white">
              Bog Biblije je oformljena grupa ljudi sa jasnim ciljem promovisanja Svetog Pisma kao
              jedinog autoriteta u oblasti religije.
            </p>
            <p className="text-white">
              Grupu čine ljudi koji nisu članovi nijedne verske, niti politicke organizacije, već
              mladi ljudi koji su uvideli da je Sveto Pismo - Božija Reč jedini put u istinu i
              život.
            </p>
            <p className="text-white">
              Danas, kada se svet suočava s moralnim slomom, idolopoklonstvom i duhovnim mrakom,
              kada ljudski život sve manje vredi, a greh postaje standard ponašanja, verujemo da
              jedino čitanje i verovanje u pisanu Božiju reč može pružiti jasan, postojan i siguran
              životni pravac.
            </p>
            <p className="text-white">
              Božiju reč su zapisivali ljudi veoma različitog društvenog sloja i pod raznim
              okolnostima. Neki su pisali na dvoru, drugi u zatvoru, neki u izgnanstvu, a neki tokom
              svojih misionskih putovanja na kojima su širili Jevanđelje. Bili su to ljudi
              različitog obrazovanja i raznih zanimanja. Neki, kao npr. Mojsije, su bili pripremani
              da budu vođe narodu, ili kao Danilo da služe na visokim položajima. Drugi su bili
              obični pastiri i ribari. Neki su bili veoma mladi, a drugi prilično stari. Neki su od
              pisaca bili i svedoci događaja o kojima su izveštavali, dok su drugi pažljivo i lično
              ispitivali te događaje pa ih zapisivali. Ali uprkos svim tim razlikama, svima je jedna
              stvar bila zajednička: Duh koji ih je vodio kroz istinu i život bez obzira kad i gde
              su živeli ili zapisivali biblijske izveštaje.
            </p>
            <p className="text-white">
              U svojoj molitvi &quot;Oče naš&quot; prva stvar koju Božiji Sin traži je
              &quot;...da se sveti ime Tvoje...&quot;(Jevanđelje po Mateju 6:9). Baš upravo sa tom
              željom i tim ciljem napravljen je ovaj sajt, da se Božije ime i njegova Sveta Reč na
              prostoru našeg regiona uzdignu na mesto koje im pripada.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
