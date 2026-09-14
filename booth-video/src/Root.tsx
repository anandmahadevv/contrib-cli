import { Composition } from "remotion"
import { BoothVideo } from "./BoothVideo"

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="BoothVideo"
        component={BoothVideo}
        durationInFrames={600}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  )
}
